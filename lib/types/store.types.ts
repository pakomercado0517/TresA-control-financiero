/**
 * Tipos relacionados con los stores de Zustand
 */

import type { CFDI, TipoComprobante } from './cfdi.types';
import type { Reporte, ReporteFiltros } from './report.types';

/**
 * Estado del store de facturas
 */
export interface InvoiceStoreState {
  invoices: CFDI[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Acciones del store de facturas
 */
export interface InvoiceStoreActions {
  addInvoice: (file: File) => Promise<{ cfdi: CFDI; validacion?: CFDI['validacion'] }>;
  importInvoices: (invoices: CFDI[]) => void;
  removeInvoice: (uuid: string) => Promise<void>;
  clearInvoices: () => void;
  getReport: (mes: number, año: number) => Reporte | null;
  getAllReports: () => Reporte[];
  getFilteredInvoices: (filtros: ReporteFiltros) => CFDI[];
  syncWithSupabase: () => Promise<void>;
}

/**
 * Store completo de facturas
 */
export type InvoiceStore = InvoiceStoreState & InvoiceStoreActions;

