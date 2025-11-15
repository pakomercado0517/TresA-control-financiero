/**
 * Store de Zustand para gestionar gastos/compras
 * 
 * Maneja gastos extraídos de XML y gastos ingresados manualmente
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Gasto,
  GastoManual,
  GastoXML,
  ReporteFiltros,
} from '@/lib/types';
import { CFDIParser } from '@/lib/xml-parser';
import { idbStorage } from '@/lib/storage/idb-storage';
import { validarGasto } from '@/lib/utils/expense-validator';
import { useProfileStore as useProfileStoreInstance } from './profile-store';
import { useInvoiceStore as useInvoiceStoreInstance } from './invoice-store';

/**
 * Convierte fechas de string a Date en un objeto de gasto
 */
function transformGastoDates(gasto: Gasto): Gasto {
  // Si la fecha ya es un objeto Date, no necesitamos convertirla
  const fecha =
    gasto.fecha instanceof Date
      ? gasto.fecha
      : new Date(gasto.fecha as unknown as string | Date);
  
  if (gasto.tipoOrigen === 'MANUAL') {
    return {
      ...gasto,
      fecha,
    } as GastoManual;
  }

  // Gasto XML
  const gastoXML = gasto as GastoXML;
  return {
    ...gastoXML,
    fecha,
    pagos: gastoXML.pagos?.map((pago) => ({
      ...pago,
      fechaPago:
        pago.fechaPago instanceof Date
          ? pago.fechaPago
          : new Date(pago.fechaPago as unknown as string | Date),
    })),
    complementoPago: gastoXML.complementoPago
      ? {
          ...gastoXML.complementoPago,
          fechaPago:
            gastoXML.complementoPago.fechaPago instanceof Date
              ? gastoXML.complementoPago.fechaPago
              : new Date(
                  gastoXML.complementoPago.fechaPago as unknown as string | Date
                ),
        }
      : undefined,
  } as GastoXML;
}

interface ExpenseStoreState {
  gastos: Gasto[];
  isLoading: boolean;
  error: string | null;
}

interface ExpenseStoreActions {
  addExpenseXML: (file: File) => Promise<{ gasto: GastoXML; validacion?: GastoXML['validacion'] }>;
  importExpenses: (expenses: Gasto[]) => void;
  addExpenseManual: (gasto: Omit<GastoManual, 'id' | 'mes' | 'año' | 'tipoOrigen' | 'tipo'> & { tipo?: 'PUE' | 'PPD' }) => void;
  removeExpense: (id: string) => void;
  clearExpenses: () => void;
  getFilteredExpenses: (filtros: ReporteFiltros) => Gasto[];
}

export type ExpenseStore = ExpenseStoreState & ExpenseStoreActions;

/**
 * Store de gastos con persistencia
 */
export const useExpenseStore = create<ExpenseStore>()(
  persist(
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

            // Si hay errores y la validación está habilitada, bloquear carga
            if (
              validacion.errores.length > 0 &&
              profile.validacionesHabilitadas.validarRFCGastos
            ) {
              throw new Error(validacion.errores.join(' '));
            }
          }

          set((state) => ({
            gastos: [...state.gastos, gastoXML],
            isLoading: false,
            error: null,
          }));

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
      addExpenseManual: (gasto: Omit<GastoManual, 'id' | 'mes' | 'año' | 'tipoOrigen' | 'tipo'> & { tipo?: 'PUE' | 'PPD' }): void => {
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
      },

      /**
       * Elimina un gasto por su ID
       */
      removeExpense: (id: string): void => {
        set((state) => ({
          gastos: state.gastos.filter((gasto) => gasto.id !== id),
        }));
      },

      /**
       * Limpia todos los gastos
       */
      clearExpenses: (): void => {
        set({ gastos: [], error: null });
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
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => idbStorage),
      // Convertir fechas de string a Date al leer del storage
      onRehydrateStorage: () => (state) => {
        if (state?.gastos) {
          state.gastos = state.gastos.map(transformGastoDates);
        }
      },
    }
  )
);

