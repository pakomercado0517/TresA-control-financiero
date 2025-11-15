/**
 * Exportaciones centralizadas de todos los tipos del proyecto
 * 
 * Importar tipos desde este archivo para mantener consistencia:
 * import type { CFDI, Reporte } from '@/lib/types';
 */

// Tipos de CFDI
export type {
  TipoComprobante,
  Pago,
  ComplementoPago,
  CFDI,
  EmisorData,
  ReceptorData,
  EstadoValidacionCFDI,
} from './cfdi.types';

// Tipos de Reportes
export type {
  Reporte,
  ReporteFiltros,
  MetricasResumen,
} from './report.types';

// Tipos de Stores
export type {
  InvoiceStoreState,
  InvoiceStoreActions,
  InvoiceStore,
} from './store.types';

// Tipos de Gastos
export type {
  TipoGasto,
  GastoManual,
  GastoXML,
  Gasto,
  EstadoValidacionGasto,
} from './expense.types';

// Tipos de Perfil
export type {
  TipoPersona,
  ValidacionesConfig,
  ClienteProfile,
  EstadoValidacion,
  RelacionComplemento,
} from './profile.types';

// Tipos Comunes
export type {
  Result,
  Mes,
  Moneda,
  FormatoMonedaOptions,
  AppConfig,
} from './common.types';

// Constantes
export { MESES } from './common.types';

