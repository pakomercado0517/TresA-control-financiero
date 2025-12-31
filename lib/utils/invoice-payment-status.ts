/**
 * Utilidades para determinar el estado de pago de facturas
 */

import type { CFDI } from '@/lib/types';

/**
 * Obtiene todos los complementos de pago relacionados con una factura PPD
 * @param facturaPPD Factura PPD
 * @param todasLasFacturas Todas las facturas (para buscar complementos relacionados)
 * @returns Array de complementos relacionados
 */
export function obtenerComplementosRelacionados(
  facturaPPD: CFDI,
  todasLasFacturas: CFDI[]
): CFDI[] {
  if (facturaPPD.tipo !== 'PPD') {
    return [];
  }

  // Buscar todos los complementos de pago relacionados con esta factura
  return todasLasFacturas.filter(
    (factura) =>
      factura.tipo === 'COMPLEMENTO_PAGO' &&
      factura.complementoPago?.uuidRelacionado === facturaPPD.uuid
  );
}

/**
 * Calcula el total pagado de una factura PPD sumando todos los complementos relacionados
 * @param facturaPPD Factura PPD
 * @param todasLasFacturas Todas las facturas (para buscar complementos relacionados)
 * @returns Total pagado de la factura PPD
 */
export function calcularTotalPagadoPPD(
  facturaPPD: CFDI,
  todasLasFacturas: CFDI[]
): number {
  if (facturaPPD.tipo !== 'PPD') {
    return 0;
  }

  const complementosRelacionados = obtenerComplementosRelacionados(
    facturaPPD,
    todasLasFacturas
  );

  // Sumar los montos de los complementos relacionados
  const totalComplementos = complementosRelacionados.reduce((sum, complemento) => {
    // Usar el monto del complemento o el total si no hay monto específico
    const monto = complemento.complementoPago?.monto || complemento.total;
    return sum + monto;
  }, 0);

  // También sumar pagos directos en la factura (si existen)
  const totalPagosDirectos =
    facturaPPD.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;

  return totalComplementos + totalPagosDirectos;
}

/**
 * Determina si una factura PPD está completamente pagada
 * @param facturaPPD Factura PPD
 * @param todasLasFacturas Todas las facturas (para buscar complementos relacionados)
 * @returns true si la factura está completamente pagada
 */
export function esFacturaPPDCompletamentePagada(
  facturaPPD: CFDI,
  todasLasFacturas: CFDI[]
): boolean {
  if (facturaPPD.tipo !== 'PPD') {
    return false;
  }

  const totalPagado = calcularTotalPagadoPPD(facturaPPD, todasLasFacturas);
  return totalPagado >= facturaPPD.total;
}

/**
 * Separa facturas en categorías según su estado de pago
 * @param facturas Todas las facturas
 * @param mes Mes para filtrar
 * @param año Año para filtrar
 * @returns Objeto con facturas separadas por categoría
 */
export function separarFacturasPorEstado(
  facturas: CFDI[],
  mes: number,
  año: number
): {
  facturasPendientes: CFDI[];
  facturasPagadas: CFDI[];
  facturasPUE: CFDI[];
  facturasPPD: CFDI[];
  complementos: CFDI[];
} {
  // Filtrar facturas del mes/año
  const facturasMes = facturas.filter(
    (inv) => inv.mes === mes && inv.año === año
  );

  // Separar por tipo
  const facturasPUE = facturasMes.filter((inv) => inv.tipo === 'PUE');
  const facturasPPD = facturasMes.filter((inv) => inv.tipo === 'PPD');
  const complementos = facturasMes.filter(
    (inv) => inv.tipo === 'COMPLEMENTO_PAGO'
  );

  // Identificar facturas PPD completamente pagadas
  const facturasPPDPagadas = facturasPPD.filter((factura) =>
    esFacturaPPDCompletamentePagada(factura, facturas)
  );

  // Facturas PPD pendientes (no completamente pagadas)
  const facturasPPDPendientes = facturasPPD.filter(
    (factura) => !esFacturaPPDCompletamentePagada(factura, facturas)
  );

  // Facturas pagadas = PUE + PPD completamente pagadas
  const facturasPagadas = [...facturasPUE, ...facturasPPDPagadas];

  return {
    facturasPendientes: facturasPPDPendientes,
    facturasPagadas,
    facturasPUE,
    facturasPPD,
    complementos,
  };
}
