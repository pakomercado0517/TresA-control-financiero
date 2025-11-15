/**
 * Utilidades para calcular reportes combinando ingresos y gastos
 */

import type { CFDI, Gasto, Reporte } from '@/lib/types';

/**
 * Calcula un reporte combinando ingresos y gastos para un mes/año específico
 */
export function calculateReport(
  invoices: CFDI[],
  expenses: Gasto[],
  mes: number,
  año: number
): Reporte {
  // Filtrar facturas y gastos del mes/año especificado
  const facturasMes = invoices.filter(
    (inv) => inv.mes === mes && inv.año === año
  );
  const gastosMes = expenses.filter(
    (exp) => exp.mes === mes && exp.año === año
  );

  // Separar facturas normales de complementos de pago
  const facturasNormales = facturasMes.filter(
    (inv) => inv.tipo !== 'COMPLEMENTO_PAGO'
  );
  const complementosPago = facturasMes.filter(
    (inv) => inv.tipo === 'COMPLEMENTO_PAGO'
  );

  // Calcular total facturado (solo facturas normales)
  const totalFacturado = facturasNormales.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  // Calcular total pagado
  let totalPagado = 0;

  // Sumar pagos de facturas PUE (ya pagadas completamente)
  const facturasPUE = facturasNormales.filter((inv) => inv.tipo === 'PUE');
  totalPagado += facturasPUE.reduce((sum, inv) => sum + inv.total, 0);

  // Sumar pagos parciales de facturas PPD
  const facturasPPD = facturasNormales.filter((inv) => inv.tipo === 'PPD');
  for (const factura of facturasPPD) {
    if (factura.pagos && factura.pagos.length > 0) {
      const totalPagosFactura = factura.pagos.reduce(
        (sum, pago) => sum + pago.monto,
        0
      );
      totalPagado += totalPagosFactura;
    }
  }

  // Sumar montos de complementos de pago
  totalPagado += complementosPago.reduce((sum, inv) => sum + inv.total, 0);

  // Calcular total de gastos
  const totalGastos = gastosMes.reduce((sum, gasto) => {
    if (gasto.tipoOrigen === 'MANUAL') {
      return sum + gasto.monto;
    } else {
      // Gasto XML
      return sum + gasto.total;
    }
  }, 0);

  // Total compras es igual al total de gastos
  const totalCompras = totalGastos;

  // Pendiente por pagar (total facturado - total pagado)
  // También incluye facturas PPD que no están completamente pagadas
  const pendientePagar = totalFacturado - totalPagado;

  // Diferencia de ingresos y gastos (ingresos pagados - gastos registrados)
  const diferenciaIngresosGastos = totalPagado - totalGastos;

  return {
    mes,
    año,
    totalFacturado,
    totalPagado,
    totalCompras,
    totalGastos,
    pendientePagar,
    diferenciaIngresosGastos,
    facturas: facturasMes,
    gastos: gastosMes,
    facturasPPD,
  };
}

