/**
 * Tipos relacionados con CFDI (Comprobante Fiscal Digital por Internet)
 */

/**
 * Tipo de comprobante fiscal
 */
export type TipoComprobante = "PUE" | "PPD" | "COMPLEMENTO_PAGO";

/**
 * Información de un pago realizado
 */
export interface Pago {
  fechaPago: Date;
  formaPago: string;
  moneda: string;
  monto: number;
  numOperacion?: string;
  numParcialidad?: number;
}

/**
 * Información de complemento de pago
 */
export interface ComplementoPago {
  fechaPago: Date;
  uuidRelacionado: string;
  monto: number;
  numParcialidad?: number;
}

/**
 * Estado de validación de una factura
 */
export interface EstadoValidacionCFDI {
  rfcVerificado: boolean;
  fechaValidacion?: Date;
  advertencias: string[];
  errores: string[];
}

/**
 * Estructura principal de una factura CFDI
 */
export interface CFDI {
  uuid: string;
  fecha: Date;
  tipo: TipoComprobante;
  total: number;
  subtotal: number;
  iva: number;
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  concepto: string;
  pagos?: Pago[];
  complementoPago?: ComplementoPago;
  mes: number;
  año: number;
  validacion?: EstadoValidacionCFDI;
}

/**
 * Datos del emisor extraídos del XML
 */
export interface EmisorData {
  rfc: string;
  nombre: string;
}

/**
 * Datos del receptor extraídos del XML
 */
export interface ReceptorData {
  rfc: string;
  nombre: string;
}
