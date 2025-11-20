/**
 * Store de Zustand para gestionar facturas CFDI
 * 
 * Maneja el estado de las facturas y la generación de reportes
 * Datos solo desde Supabase - sin IndexedDB
 */

import { create } from 'zustand';
import type {
  CFDI,
  InvoiceStore,
  Reporte,
  ReporteFiltros,
} from '@/lib/types';
import { CFDIParser } from '@/lib/xml-parser';
import { validarFacturaIngreso } from '@/lib/utils/invoice-validator';
import { compararRFCs } from '@/lib/utils/rfc-validator';
import { useProfileStore as useProfileStoreInstance } from './profile-store';
import { useExpenseStore as useExpenseStoreInstance } from './expense-store';
import { calculateReport } from '@/lib/utils/report-calculator';
import {
  saveInvoiceToSupabase,
  syncInvoicesFromSupabase,
  deleteInvoiceFromSupabase,
} from '@/lib/supabase/invoices';
import { supabase } from '@/lib/supabase/client';

/**
 * Store de facturas - Datos solo desde Supabase
 */
export const useInvoiceStore = create<InvoiceStore>()(
  (set, get) => ({
      // Estado inicial
      invoices: [],
      isLoading: false,
      error: null,

      /**
       * Sincroniza facturas con Supabase (carga desde Supabase)
       */
      syncWithSupabase: async (): Promise<void> => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            // Si no hay usuario, limpiar datos
            set({ invoices: [] });
            return;
          }

          // Cargar facturas desde Supabase (RLS asegura que solo sean del usuario)
          const supabaseInvoices = await syncInvoicesFromSupabase(user.id);

          // Actualizar estado solo con facturas de Supabase
          set({
            invoices: supabaseInvoices,
          });
        } catch (error) {
          console.warn('Error al sincronizar con Supabase:', error);
        }
      },

      /**
       * Agrega una nueva factura parseando el archivo XML
       */
      addInvoice: async (file: File): Promise<{ cfdi: CFDI; validacion?: CFDI['validacion'] }> => {
        set({ isLoading: true, error: null });

        try {
          const parser = new CFDIParser();
          const cfdi = await parser.parseXML(file);

          // Verificar si la factura ya existe (por UUID)
          const { invoices } = get();
          const existe = invoices.some((inv) => inv.uuid === cfdi.uuid);

          if (existe) {
            throw new Error(
              `La factura con UUID ${cfdi.uuid} ya existe en el sistema`
            );
          }

          // Obtener perfil del cliente para validaciones
          const profileState = useProfileStoreInstance.getState();
          const profile = profileState.profile;

          // VALIDACIÓN CRÍTICA: Verificar que el RFC emisor coincida con el RFC del perfil
          if (profile && profile.rfc) {
            const rfcCoincide = compararRFCs(cfdi.rfcEmisor, profile.rfc);

            if (!rfcCoincide) {
              throw new Error(
                `No se puede cargar esta factura: El RFC del emisor (${cfdi.rfcEmisor}) no coincide con tu RFC (${profile.rfc}). Esta factura no pertenece a tu empresa.`
              );
            }
          } else if (!profile || !profile.rfc) {
            throw new Error(
              'No se puede cargar la factura: Debes configurar tu RFC en el perfil antes de cargar facturas. Ve a Configuración para completar tu perfil.'
            );
          }

          let validacion: CFDI['validacion'] | undefined;

          // Validar factura si hay perfil configurado
          if (profile) {
            // Obtener facturas PPD para buscar matches
            const facturasPPD = invoices.filter((inv) => inv.tipo === 'PPD');

            validacion = validarFacturaIngreso(
              cfdi,
              profile.rfc,
              profile.validacionesHabilitadas,
              facturasPPD
            );

            // Agregar validación a la factura
            cfdi.validacion = validacion;
          }

          set((state) => ({
            invoices: [...state.invoices, cfdi],
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
              console.log('Guardando factura en Supabase:', {
                uuid: cfdi.uuid,
                userId: user.id,
              });
              await saveInvoiceToSupabase(cfdi, user.id);
              console.log('Factura guardada exitosamente en Supabase');
            } else {
              console.warn('No hay usuario autenticado, no se guardará en Supabase');
            }
          } catch (supabaseError) {
            // Loggear el error completo para diagnóstico
            console.error('Error al sincronizar factura con Supabase:', {
              error: supabaseError,
              message: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
              stack: supabaseError instanceof Error ? supabaseError.stack : undefined,
            });
            // No fallar el proceso de carga, pero sí loggear el error
            // El usuario puede sincronizar manualmente después
          }

          return { cfdi, validacion };
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
       * Importa facturas desde un array (útil para restauración de backup)
       */
      importInvoices: (newInvoices: CFDI[]): void => {
        set((state) => {
          // Evitar duplicados por UUID
          const existingUuids = new Set(state.invoices.map((inv) => inv.uuid));
          const uniqueInvoices = newInvoices.filter(
            (inv) => !existingUuids.has(inv.uuid)
          );
          return {
            invoices: [...state.invoices, ...uniqueInvoices],
          };
        });
      },

      /**
       * Elimina una factura por su UUID
       */
      removeInvoice: async (uuid: string): Promise<void> => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.uuid !== uuid),
        }));

        // Sincronizar con Supabase si hay usuario autenticado
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await deleteInvoiceFromSupabase(uuid, user.id);
          }
        } catch (supabaseError) {
          console.warn('Error al eliminar factura de Supabase:', supabaseError);
        }
      },

      /**
       * Limpia todas las facturas
       */
      clearInvoices: (): void => {
        set({ invoices: [], error: null });
      },

      /**
       * Genera un reporte para un mes y año específicos
       * 
       * Delega el cálculo al utilitario centralizado `calculateReport`
       * para mantener consistencia con el dashboard
       */
      getReport: (mes: number, año: number): Reporte | null => {
        const { invoices } = get();
        
        // Obtener gastos del expense store
        const expenseStore = useExpenseStoreInstance.getState();
        const expenses = expenseStore.gastos;

        // Si no hay facturas ni gastos para este mes/año, retornar null
        const facturasMes = invoices.filter(
          (inv) => inv.mes === mes && inv.año === año
        );
        const gastosMes = expenses.filter(
          (exp) => exp.mes === mes && exp.año === año
        );

        if (facturasMes.length === 0 && gastosMes.length === 0) {
          return null;
        }

        // Delegar el cálculo al utilitario centralizado
        return calculateReport(invoices, expenses, mes, año);
      },

      /**
       * Obtiene todos los reportes disponibles (agrupados por mes/año)
       */
      getAllReports: (): Reporte[] => {
        const { invoices } = get();

        if (invoices.length === 0) {
          return [];
        }

        // Crear un mapa de claves únicas (año-mes)
        const reportesMap = new Map<string, Reporte>();

        // Obtener todos los meses/años únicos
        const mesesAños = new Set(
          invoices.map((inv) => `${inv.año}-${inv.mes}`)
        );

        // Generar reporte para cada mes/año
        for (const mesAño of mesesAños) {
          const [añoStr, mesStr] = mesAño.split('-');
          const año = parseInt(añoStr, 10);
          const mes = parseInt(mesStr, 10);

          const reporte = get().getReport(mes, año);

          if (reporte) {
            reportesMap.set(mesAño, reporte);
          }
        }

        // Ordenar por año y mes (más reciente primero)
        return Array.from(reportesMap.values()).sort((a, b) => {
          if (a.año !== b.año) {
            return b.año - a.año;
          }
          return b.mes - a.mes;
        });
      },

      /**
       * Obtiene facturas filtradas según los criterios especificados
       */
      getFilteredInvoices: (filtros: ReporteFiltros): CFDI[] => {
        const { invoices } = get();

        return invoices.filter((inv) => {
          // Filtro por mes
          if (filtros.mes !== undefined && inv.mes !== filtros.mes) {
            return false;
          }

          // Filtro por año
          if (filtros.año !== undefined && inv.año !== filtros.año) {
            return false;
          }

          // Filtro por tipo de comprobante
          if (
            filtros.tipoComprobante !== undefined &&
            inv.tipo !== filtros.tipoComprobante
          ) {
            return false;
          }

          // Filtro por RFC del emisor
          if (
            filtros.rfcEmisor !== undefined &&
            inv.rfcEmisor !== filtros.rfcEmisor
          ) {
            return false;
          }

          return true;
        });
      },
    })
);
