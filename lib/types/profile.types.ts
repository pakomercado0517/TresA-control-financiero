/**
 * Tipos relacionados con el perfil del cliente
 */

/**
 * Tipo de persona (Física o Moral)
 */
export type TipoPersona = 'FISICA' | 'MORAL';

/**
 * Configuración de validaciones
 */
export interface ValidacionesConfig {
  validarRFCIngresos: boolean;
  validarRFCGastos: boolean;
  validarMatchesComplementos: boolean;
}

/**
 * Perfil del cliente
 */
export interface ClienteProfile {
  id: string;
  nombre: string;
  rfc: string;
  tipoPersona: TipoPersona;
  email?: string;
  validacionesHabilitadas: ValidacionesConfig;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

/**
 * Estado de validación de una factura o gasto
 */
export interface EstadoValidacion {
  rfcVerificado: boolean;
  fechaValidacion?: Date;
  advertencias: string[];
  errores: string[];
}

/**
 * Relación entre complemento de pago y factura PPD
 */
export interface RelacionComplemento {
  complementoUUID: string;
  facturaUUID: string;
  fechaRelacion: Date;
  montoRelacionado: number;
  verificado: boolean;
}

