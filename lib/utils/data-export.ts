/**
 * Utilidades para exportar e importar datos
 */

import type { CFDI, Gasto } from '@/lib/types';

/**
 * Tipos para exportación (fechas como strings para JSON)
 */
type ExportedPago = {
  fechaPago: string;
  formaPago: string;
  moneda: string;
  monto: number;
  numOperacion?: string;
  numParcialidad?: number;
};

type ExportedComplementoPago = {
  fechaPago: string;
  uuidRelacionado: string;
  monto: number;
  numParcialidad?: number;
};

type ExportedValidacionCFDI = {
  rfcVerificado: boolean;
  fechaValidacion?: string;
  advertencias: string[];
  errores: string[];
};

type ExportedCFDI = Omit<CFDI, 'fecha' | 'pagos' | 'complementoPago' | 'validacion'> & {
  fecha: string;
  pagos?: ExportedPago[];
  complementoPago?: ExportedComplementoPago;
  validacion?: ExportedValidacionCFDI;
};

type ExportedGastoManual = Omit<Gasto, 'fecha'> & { fecha: string };

type ExportedValidacionGasto = {
  rfcVerificado: boolean;
  fechaValidacion?: string;
  advertencias: string[];
  errores: string[];
};

type ExportedGastoXML = Omit<Extract<Gasto, { tipoOrigen: 'XML' }>, 'fecha' | 'pagos' | 'complementoPago' | 'validacion'> & {
  fecha: string;
  pagos?: ExportedPago[];
  complementoPago?: ExportedComplementoPago;
  validacion?: ExportedValidacionGasto;
};

type ExportedGasto = ExportedGastoManual | ExportedGastoXML;

/**
 * Estructura de datos exportados
 */
export interface ExportedData {
  version: string;
  exportDate: string;
  invoices: ExportedCFDI[];
  expenses: ExportedGasto[];
}

/**
 * Exporta todos los datos (ingresos y gastos) a JSON
 */
export async function exportAllData(
  invoices: CFDI[],
  expenses: Gasto[]
): Promise<void> {
  const data: ExportedData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    invoices: invoices.map((inv) => ({
      ...inv,
      fecha: inv.fecha.toISOString(),
      pagos: inv.pagos?.map((pago) => ({
        ...pago,
        fechaPago: pago.fechaPago.toISOString(),
      })),
      complementoPago: inv.complementoPago
        ? {
            ...inv.complementoPago,
            fechaPago: inv.complementoPago.fechaPago.toISOString(),
          }
        : undefined,
      validacion: inv.validacion
        ? {
            ...inv.validacion,
            fechaValidacion: inv.validacion.fechaValidacion?.toISOString(),
          }
        : undefined,
    })),
    expenses: expenses.map((exp) => {
      const base = {
        ...exp,
        fecha: exp.fecha.toISOString(),
      };

      if (exp.tipoOrigen === 'XML') {
        return {
          ...base,
          pagos: exp.pagos?.map((pago) => ({
            ...pago,
            fechaPago: pago.fechaPago.toISOString(),
          })),
          complementoPago: exp.complementoPago
            ? {
                ...exp.complementoPago,
                fechaPago: exp.complementoPago.fechaPago.toISOString(),
              }
            : undefined,
          validacion: exp.validacion
            ? {
                ...exp.validacion,
                fechaValidacion: exp.validacion.fechaValidacion?.toISOString(),
              }
            : undefined,
        };
      }

      return base;
    }),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `control-ingresos-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importa datos desde un archivo JSON
 */
export async function importData(
  file: File
): Promise<{ invoices: CFDI[]; expenses: Gasto[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data: ExportedData = JSON.parse(text);

        // Validar estructura básica
        if (!data.version || !data.invoices || !data.expenses) {
          throw new Error('Formato de archivo inválido');
        }

        // Convertir fechas de string a Date
        const invoices: CFDI[] = data.invoices.map((inv) => ({
          ...inv,
          fecha: new Date(inv.fecha),
          pagos: inv.pagos?.map((pago) => ({
            ...pago,
            fechaPago: new Date(pago.fechaPago),
          })),
          complementoPago: inv.complementoPago
            ? {
                ...inv.complementoPago,
                fechaPago: new Date(inv.complementoPago.fechaPago),
              }
            : undefined,
          validacion: inv.validacion
            ? {
                ...inv.validacion,
                fechaValidacion: inv.validacion.fechaValidacion
                  ? new Date(inv.validacion.fechaValidacion)
                  : undefined,
              }
            : undefined,
        }));

        const expenses: Gasto[] = data.expenses.map((exp): Gasto => {
          const fecha = new Date(exp.fecha);

          if (exp.tipoOrigen === 'XML') {
            // GastoXML - usar type assertion ya que TypeScript no puede inferir la unión discriminada
            const expXML = exp as ExportedGastoXML;
            return {
              ...expXML,
              fecha,
              pagos: expXML.pagos?.map((pago) => ({
                ...pago,
                fechaPago: new Date(pago.fechaPago),
              })),
              complementoPago: expXML.complementoPago
                ? {
                    ...expXML.complementoPago,
                    fechaPago: new Date(expXML.complementoPago.fechaPago),
                  }
                : undefined,
              validacion: expXML.validacion
                ? {
                    ...expXML.validacion,
                    fechaValidacion: expXML.validacion.fechaValidacion
                      ? new Date(expXML.validacion.fechaValidacion)
                      : undefined,
                  }
                : undefined,
            } as Gasto;
          } else {
            // GastoManual
            const expManual = exp as ExportedGastoManual;
            return {
              ...expManual,
              fecha,
            } as Gasto;
          }
        });

        resolve({ invoices, expenses });
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error('Error al importar archivo')
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(file);
  });
}

