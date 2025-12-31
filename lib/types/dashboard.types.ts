/**
 * Tipos relacionados con el dashboard y sus componentes
 */

import type { CFDI, TipoComprobante, Mes } from './index';

/**
 * Filtros del dashboard
 */
export interface DashboardFilters {
  mes: number;
  año: number;
}

/**
 * Configuración de paginación para tablas
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
}

/**
 * Estado de paginación
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
}

/**
 * Configuración de ordenamiento para tablas
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Campo por el cual se puede ordenar en tablas de facturas
 */
export type InvoiceSortField =
  | 'fecha'
  | 'tipo'
  | 'total'
  | 'rfcEmisor'
  | 'rfcReceptor'
  | 'uuid';

/**
 * Configuración de ordenamiento para facturas
 */
export interface InvoiceSortConfig {
  field: InvoiceSortField;
  direction: SortDirection;
}

/**
 * Configuración de visualización de tablas
 */
export interface TableDisplayConfig {
  showPagination?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  defaultPageSize?: number;
  maxHeight?: number; // Altura máxima antes de hacer scroll
}

/**
 * Props base para componentes de tabla de facturas
 */
export interface BaseInvoiceTableProps {
  facturas: CFDI[];
  isLoading?: boolean;
  onSortChange?: (sort: InvoiceSortConfig) => void;
  sortConfig?: InvoiceSortConfig;
}

/**
 * Props para la tabla de todas las facturas
 */
export interface AllInvoicesTableProps extends BaseInvoiceTableProps {
  /**
   * Configuración de paginación
   */
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Configuración de visualización
   */
  displayConfig?: TableDisplayConfig;
}

/**
 * Props para la tabla de facturas pendientes (PPD)
 */
export interface PendingInvoicesTableProps
  extends Omit<BaseInvoiceTableProps, 'facturas'> {
  /**
   * Facturas PPD a mostrar
   */
  facturasPPD: CFDI[];
  /**
   * Configuración de paginación (opcional)
   */
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Datos calculados para una factura PPD (para mostrar en tabla)
 */
export interface PendingInvoiceCalculatedData {
  factura: CFDI;
  totalPagado: number;
  pendiente: number;
  porcentajePagado: number;
  cantidadPagos: number;
}

/**
 * Métricas resumidas para mostrar en cards
 */
export interface DashboardMetrics {
  totalFacturado: number;
  totalPagado: number;
  totalCompras: number;
  pendientePagar: number;
  diferenciaIngresosGastos: number;
  cantidadFacturas: number;
  cantidadGastos: number;
}

/**
 * Estado del dashboard
 */
export interface DashboardState {
  filters: DashboardFilters;
  pagination: {
    allInvoices: PaginationState;
    pendingInvoices: PaginationState;
  };
  sorting: {
    allInvoices: InvoiceSortConfig;
    pendingInvoices: InvoiceSortConfig;
  };
  displayConfig: TableDisplayConfig;
}

/**
 * Configuración inicial del dashboard
 */
export interface DashboardInitialConfig {
  defaultFilters?: Partial<DashboardFilters>;
  defaultPageSize?: number;
  displayConfig?: Partial<TableDisplayConfig>;
}

/**
 * Callbacks del dashboard
 */
export interface DashboardCallbacks {
  onFilterChange?: (filters: DashboardFilters) => void;
  onSortChange?: (table: 'all' | 'pending', sort: InvoiceSortConfig) => void;
  onPageChange?: (table: 'all' | 'pending', page: number) => void;
  onPageSizeChange?: (table: 'all' | 'pending', pageSize: number) => void;
}

/**
 * Información de resumen de una tabla
 */
export interface TableSummaryInfo {
  totalItems: number;
  showingFrom: number;
  showingTo: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Utilidad para calcular el estado de paginación
 */
export function calculatePaginationState(
  currentPage: number,
  pageSize: number,
  totalItems: number
): PaginationState {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const showingFrom = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const showingTo = Math.min(validCurrentPage * pageSize, totalItems);

  return {
    currentPage: validCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    showingFrom,
    showingTo,
  };
}

