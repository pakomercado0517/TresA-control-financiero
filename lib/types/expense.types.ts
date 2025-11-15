/**
 * Tipos relacionados con gastos/compras
 */

/**
 * Tipo de gasto
 */
export type TipoGasto = 'XML' | 'MANUAL';

/**
 * Gasto manual ingresado por el usuario
 */
export interface GastoManual {
  id: string;
  fecha: Date;
  monto: number;
  concepto: string;
  tipo: 'PUE' | 'PPD';
  mes: number;
  año: number;
  tipoOrigen: 'MANUAL';
}

/**
 * Estado de validación de un gasto
 */
export interface EstadoValidacionGasto {
  rfcVerificado: boolean;
  fechaValidacion?: Date;
  advertencias: string[];
  errores: string[];
}

/**
 * Gasto extraído de XML (CFDI)
 */
export interface GastoXML {
  id: string;
  uuid: string;
  fecha: Date;
  total: number;
  subtotal: number;
  iva: number;
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  concepto: string;
  tipo: 'PUE' | 'PPD' | 'COMPLEMENTO_PAGO';
  pagos?: Array<{
    fechaPago: Date;
    formaPago: string;
    moneda: string;
    monto: number;
    numOperacion?: string;
    numParcialidad?: number;
  }>;
  complementoPago?: {
    fechaPago: Date;
    uuidRelacionado: string;
    monto: number;
    numParcialidad?: number;
  };
  mes: number;
  año: number;
  tipoOrigen: 'XML';
  validacion?: EstadoValidacionGasto;
}

/**
 * Unión de tipos de gasto
 */
export type Gasto = GastoManual | GastoXML;

