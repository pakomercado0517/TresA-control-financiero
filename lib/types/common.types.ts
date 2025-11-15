/**
 * Tipos comunes y utilitarios del proyecto
 */

/**
 * Resultado de una operación que puede fallar
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Meses del año en español
 */
export type Mes =
  | 'Enero'
  | 'Febrero'
  | 'Marzo'
  | 'Abril'
  | 'Mayo'
  | 'Junio'
  | 'Julio'
  | 'Agosto'
  | 'Septiembre'
  | 'Octubre'
  | 'Noviembre'
  | 'Diciembre';

/**
 * Mapeo de número de mes a nombre
 */
export const MESES: readonly Mes[] = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

/**
 * Formato de moneda
 */
export type Moneda = 'MXN' | 'USD' | 'EUR';

/**
 * Opciones para formatear números como moneda
 */
export interface FormatoMonedaOptions {
  moneda?: Moneda;
  mostrarSimbolo?: boolean;
  decimales?: number;
}

/**
 * Configuración de la aplicación
 */
export interface AppConfig {
  zonaHoraria: string;
  formatoFecha: string;
  monedaDefault: Moneda;
  limiteArchivosMB: number;
}

