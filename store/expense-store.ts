/**
 * Store de Zustand para gestionar gastos/compras
 * 
 * Maneja gastos extraídos de XML y gastos ingresados manualmente
 * Datos solo desde Supabase - sin IndexedDB
 */

import { create } from 'zustand';
import type {
  Gasto,
  GastoManual,
  GastoXML,
  ReporteFiltros,
} from '@/lib/types';
import { CFDIParser } from '@/lib/xml-parser';
import { validarGasto } from '@/lib/utils/expense-validator';
import { compararRFCs } from '@/lib/utils/rfc-validator';
import { useProfileStore as useProfileStoreInstance } from './profile-store';
import { useInvoiceStore as useInvoiceStoreInstance } from './invoice-store';
import {
  saveExpenseToSupabase,
  fetchExpensesFromSupabase,
  deleteExpenseFromSupabase,
} from '@/lib/supabase/expenses';
import { supabase } from '@/lib/supabase/client';

interface ExpenseStoreState {
  gastos: Gasto[];
  isLoading: boolean;
  error: string | null;
}

interface ExpenseStoreActions {
  addExpenseXML: (file: File) => Promise<{ gasto: GastoXML; validacion?: GastoXML['validacion'] }>;
  importExpenses: (expenses: Gasto[]) => void;
  addExpenseManual: (gasto: Omit<GastoManual, 'id' | 'mes' | 'año' | 'tipoOrigen' | 'tipo'> & { tipo?: 'PUE' | 'PPD' }) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  clearExpenses: () => void;
  getFilteredExpenses: (filtros: ReporteFiltros) => Gasto[];
  syncWithSupabase: () => Promise<void>;
}

export type ExpenseStore = ExpenseStoreState & ExpenseStoreActions;

/**
 * Store de gastos - Datos solo desde Supabase
 */
export const useExpenseStore = create<ExpenseStore>()(
  (set, get) => ({
      // Estado inicial
      gastos: [],
      isLoading: false,
      error: null,

      /**
       * Agrega un gasto desde un archivo XML
       */
      addExpenseXML: async (file: File): Promise<{ gasto: GastoXML; validacion?: GastoXML['validacion'] }> => {
        set({ isLoading: true, error: null });

        try {
          const parser = new CFDIParser();
          const cfdi = await parser.parseXML(file);

          // Verificar si el gasto ya existe (por UUID)
          const { gastos } = get();
          const existe = gastos.some(
            (gasto) => gasto.tipoOrigen === 'XML' && gasto.uuid === cfdi.uuid
          );

          if (existe) {
            throw new Error(
              `El gasto con UUID ${cfdi.uuid} ya existe en el sistema`
            );
          }

          // Obtener perfil del cliente para validaciones
          const profileState = useProfileStoreInstance.getState();
          const profile = profileState.profile;

          // VALIDACIÓN CRÍTICA: Verificar que el RFC receptor coincida con el RFC del perfil
          // En gastos, el cliente es el receptor de la factura
          if (profile && profile.rfc) {
            const rfcCoincide = compararRFCs(cfdi.rfcReceptor, profile.rfc);

            if (!rfcCoincide) {
              throw new Error(
                `No se puede cargar este gasto: El RFC del receptor (${cfdi.rfcReceptor}) no coincide con tu RFC (${profile.rfc}). Esta factura no pertenece a tu empresa.`
              );
            }
          } else if (!profile || !profile.rfc) {
            throw new Error(
              'No se puede cargar el gasto: Debes configurar tu RFC en el perfil antes de cargar gastos. Ve a Configuración para completar tu perfil.'
            );
          }

          // Convertir CFDI a GastoXML
          const gastoXML: GastoXML = {
            id: `xml-${cfdi.uuid}`,
            uuid: cfdi.uuid,
            fecha: cfdi.fecha,
            total: cfdi.total,
            subtotal: cfdi.subtotal,
            iva: cfdi.iva,
            rfcEmisor: cfdi.rfcEmisor,
            nombreEmisor: cfdi.nombreEmisor,
            rfcReceptor: cfdi.rfcReceptor,
            nombreReceptor: cfdi.nombreReceptor,
            concepto: cfdi.concepto,
            tipo: cfdi.tipo,
            pagos: cfdi.pagos,
            complementoPago: cfdi.complementoPago,
            mes: cfdi.mes,
            año: cfdi.año,
            tipoOrigen: 'XML',
          };

          let validacion: GastoXML['validacion'] | undefined;

          // Validar gasto si hay perfil configurado
          if (profile) {
            // Obtener facturas PPD de ingresos para buscar matches
            const invoiceState = useInvoiceStoreInstance.getState();
            const facturasPPD = invoiceState.invoices.filter(
              (inv) => inv.tipo === 'PPD'
            );

            validacion = validarGasto(
              gastoXML,
              profile.rfc,
              profile.validacionesHabilitadas,
              facturasPPD
            );

            // Agregar validación al gasto
            gastoXML.validacion = validacion;
          }

          set((state) => ({
            gastos: [...state.gastos, gastoXML],
            isLoading: false,
            error: null,
          }));

          // Sincronizar con Supabase si hay usuario autenticado
          try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
              console.error('Error al obtener usuario autenticado:', authError);
              throw new Error('No se pudo obtener el usuario autenticado');
            }

            if (user) {
              console.log('Guardando gasto en Supabase:', {
                uuid: gastoXML.uuid,
                userId: user.id,
              });
              await saveExpenseToSupabase(gastoXML, user.id);
              console.log('Gasto guardado exitosamente en Supabase');
            } else {
              console.warn('No hay usuario autenticado, no se guardará en Supabase');
            }
          } catch (supabaseError) {
            // Loggear el error completo para diagnóstico
            console.error('Error al sincronizar gasto con Supabase:', {
              error: supabaseError,
              message: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
              stack: supabaseError instanceof Error ? supabaseError.stack : undefined,
            });
            // No fallar el proceso de carga, pero sí loggear el error
            // El usuario puede sincronizar manualmente después
          }

          return { gasto: gastoXML, validacion };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Error desconocido al procesar XML';

          set({
            error: errorMessage,
            isLoading: false,
          });

          throw error;
        }
      },

      /**
       * Importa gastos desde un array (útil para restauración de backup)
       */
      importExpenses: (newExpenses: Gasto[]): void => {
        set((state) => {
          // Evitar duplicados por ID
          const existingIds = new Set(state.gastos.map((g) => g.id));
          const uniqueExpenses = newExpenses.filter(
            (exp) => !existingIds.has(exp.id)
          );
          return {
            gastos: [...state.gastos, ...uniqueExpenses],
          };
        });
      },

      /**
       * Agrega un gasto manual
       */
      addExpenseManual: async (gasto: Omit<GastoManual, 'id' | 'mes' | 'año' | 'tipoOrigen' | 'tipo'> & { tipo?: 'PUE' | 'PPD' }): Promise<void> => {
        const fecha = gasto.fecha;
        const mes = fecha.getMonth() + 1;
        const año = fecha.getFullYear();
        const id = `manual-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const gastoManual: GastoManual = {
          ...gasto,
          tipo: gasto.tipo || 'PUE', // Por defecto PUE si no se especifica
          id,
          mes,
          año,
          tipoOrigen: 'MANUAL',
        };

        set((state) => ({
          gastos: [...state.gastos, gastoManual],
          error: null,
        }));

        // Sincronizar con Supabase si hay usuario autenticado
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await saveExpenseToSupabase(gastoManual, user.id);
          }
        } catch (supabaseError) {
          console.warn('Error al sincronizar gasto manual con Supabase:', supabaseError);
        }
      },

      /**
       * Elimina un gasto por su ID
       */
      removeExpense: async (id: string): Promise<void> => {
        set((state) => ({
          gastos: state.gastos.filter((gasto) => gasto.id !== id),
        }));

        // Sincronizar con Supabase si hay usuario autenticado
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await deleteExpenseFromSupabase(id, user.id);
          }
        } catch (supabaseError) {
          console.warn('Error al eliminar gasto de Supabase:', supabaseError);
        }
      },

      /**
       * Limpia todos los gastos
       */
      clearExpenses: (): void => {
        set({ gastos: [], error: null });
      },

      /**
       * Sincroniza gastos con Supabase (carga desde Supabase)
       */
      syncWithSupabase: async (): Promise<void> => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            // Si no hay usuario, limpiar datos
            set({ gastos: [] });
            return;
          }

          // Cargar gastos desde Supabase (RLS asegura que solo sean del usuario)
          const supabaseExpenses = await fetchExpensesFromSupabase(user.id);

          // Actualizar estado solo con gastos de Supabase
          set({
            gastos: supabaseExpenses,
          });
        } catch (error) {
          console.warn('Error al sincronizar gastos con Supabase:', error);
        }
      },

      /**
       * Obtiene gastos filtrados según los criterios especificados
       */
      getFilteredExpenses: (filtros: ReporteFiltros): Gasto[] => {
        const { gastos } = get();

        return gastos.filter((gasto) => {
          // Filtro por mes
          if (filtros.mes !== undefined && gasto.mes !== filtros.mes) {
            return false;
          }

          // Filtro por año
          if (filtros.año !== undefined && gasto.año !== filtros.año) {
            return false;
          }

          // Filtro por tipo de comprobante
          if (filtros.tipoComprobante !== undefined) {
            // Los gastos manuales solo pueden ser PUE o PPD (no COMPLEMENTO_PAGO)
            if (
              filtros.tipoComprobante === 'COMPLEMENTO_PAGO' &&
              gasto.tipoOrigen === 'MANUAL'
            ) {
              return false;
            }
            if (gasto.tipo !== filtros.tipoComprobante) {
              return false;
            }
          }

          // Filtro por RFC del emisor (solo para XML)
          if (filtros.rfcEmisor !== undefined) {
            if (gasto.tipoOrigen === 'XML') {
              if (gasto.rfcEmisor !== filtros.rfcEmisor) {
                return false;
              }
            } else {
              // Para gastos manuales, no aplicar este filtro
              return false;
            }
          }

          return true;
        });
      },
    })
);
