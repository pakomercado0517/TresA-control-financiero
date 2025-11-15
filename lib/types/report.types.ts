/**
 * Tipos relacionados con reportes financieros
 */

import type { CFDI } from './cfdi.types';
import type { Gasto } from './expense.types';

/**
 * Estructura de un reporte financiero
 */
export interface Reporte {
  mes: number;
  año: number;
  totalFacturado: number;
  totalPagado: number;
  totalCompras: number;
  totalGastos: number;
  pendientePagar: number;
  diferenciaIngresosGastos: number;
  facturas: CFDI[];
  gastos: Gasto[];
  facturasPPD: CFDI[];
}

/**
 * Filtros para generar reportes
 */
export interface ReporteFiltros {
  mes?: number;
  año?: number;
  tipoComprobante?: CFDI['tipo'];
  rfcEmisor?: string;
}

/**
 * Métricas resumidas para el dashboard
 */
export interface MetricasResumen {
  totalFacturado: number;
  totalPagado: number;
  totalCompras: number;
  pendientePagar: number;
  cantidadFacturas: number;
}

