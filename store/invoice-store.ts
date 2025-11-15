/**
 * Store de Zustand para gestionar facturas CFDI
 * 
 * Maneja el estado de las facturas, su persistencia y la generación de reportes
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CFDI,
  InvoiceStore,
  Reporte,
  ReporteFiltros,
} from '@/lib/types';
import { CFDIParser } from '@/lib/xml-parser';
import { idbStorage } from '@/lib/storage/idb-storage';
import { validarFacturaIngreso } from '@/lib/utils/invoice-validator';
import { useProfileStore as useProfileStoreInstance } from './profile-store';
import { useExpenseStore as useExpenseStoreInstance } from './expense-store';
import { calculateReport } from '@/lib/utils/report-calculator';

/**
 * Convierte fechas de string a Date en un objeto CFDI
 */
function transformCFDIDates(cfdi: CFDI): CFDI {
  // Si la fecha ya es un objeto Date, no necesitamos convertirla
  const fecha =
    cfdi.fecha instanceof Date
      ? cfdi.fecha
      : new Date(cfdi.fecha as unknown as string | Date);
  
  // Convertir complemento de pago si existe
  let complementoPago = cfdi.complementoPago;
  if (complementoPago) {
    const fechaPagoComplemento =
      complementoPago.fechaPago instanceof Date
        ? complementoPago.fechaPago
        : new Date(
            complementoPago.fechaPago as unknown as string | Date
          );
    
    complementoPago = {
      ...complementoPago,
      fechaPago: fechaPagoComplemento,
    };

    // Para complementos de pago, la fecha principal debe ser la fecha de pago del complemento
    // NO la fecha de timbrado. Verificar si es complemento y ajustar fecha si es necesario
    if (cfdi.tipo === 'COMPLEMENTO_PAGO' && complementoPago.fechaPago) {
      // Si la fecha actual no coincide con la fecha de pago del complemento,
      // usar la fecha de pago (esto puede pasar si se rehidrata desde storage)
      const fechaActual = fecha.getTime();
      const fechaPagoComplementoTime = fechaPagoComplemento.getTime();
      
      if (Math.abs(fechaActual - fechaPagoComplementoTime) > 1000) {
        // Hay diferencia significativa, usar fecha de pago
        console.log(
          `[Invoice Store] Ajustando fecha de complemento de pago: ${new Date(fechaActual).toISOString()} -> ${fechaPagoComplemento.toISOString()}`
        );
        return {
          ...cfdi,
          fecha: fechaPagoComplemento,
          mes: fechaPagoComplemento.getMonth() + 1,
          año: fechaPagoComplemento.getFullYear(),
          pagos: cfdi.pagos?.map((pago) => ({
            ...pago,
            fechaPago:
              pago.fechaPago instanceof Date
                ? pago.fechaPago
                : new Date(pago.fechaPago as unknown as string | Date),
          })),
          complementoPago,
        };
      }
    }
  }
  
  return {
    ...cfdi,
    fecha,
    pagos: cfdi.pagos?.map((pago) => ({
      ...pago,
      fechaPago:
        pago.fechaPago instanceof Date
          ? pago.fechaPago
          : new Date(pago.fechaPago as unknown as string | Date),
    })),
    complementoPago,
  };
}

/**
 * Store de facturas con persistencia
 */
export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      invoices: [],
      isLoading: false,
      error: null,

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
      removeInvoice: (uuid: string): void => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.uuid !== uuid),
        }));
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
    }),
    {
      name: 'invoice-storage',
      storage: createJSONStorage(() => idbStorage),
      // Convertir fechas de string a Date al leer del storage
      onRehydrateStorage: () => (state) => {
        if (state?.invoices) {
          state.invoices = state.invoices.map(transformCFDIDates);
        }
      },
    }
  )
);

