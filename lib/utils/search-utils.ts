/**
 * Utilidades para búsqueda en facturas y gastos
 */

import type { CFDI, Gasto } from '@/lib/types';

/**
 * Busca en una lista de facturas por diferentes campos
 * @param facturas Lista de facturas
 * @param searchTerm Término de búsqueda
 * @returns Facturas que coinciden con la búsqueda
 */
export function searchInvoices(facturas: CFDI[], searchTerm: string): CFDI[] {
  if (!searchTerm.trim()) {
    return facturas;
  }

  const term = searchTerm.toLowerCase().trim();

  return facturas.filter((factura) => {
    // Buscar en UUID
    if (factura.uuid.toLowerCase().includes(term)) {
      return true;
    }

    // Buscar en RFC Emisor
    if (factura.rfcEmisor.toLowerCase().includes(term)) {
      return true;
    }

    // Buscar en RFC Receptor
    if (factura.rfcReceptor.toLowerCase().includes(term)) {
      return true;
    }

    // Buscar en Nombre Emisor
    if (factura.nombreEmisor?.toLowerCase().includes(term)) {
      return true;
    }

    // Buscar en Nombre Receptor
    if (factura.nombreReceptor?.toLowerCase().includes(term)) {
      return true;
    }

    // Buscar en Concepto
    if (factura.concepto?.toLowerCase().includes(term)) {
      return true;
    }

    return false;
  });
}

/**
 * Busca en una lista de gastos por diferentes campos
 * @param gastos Lista de gastos
 * @param searchTerm Término de búsqueda
 * @returns Gastos que coinciden con la búsqueda
 */
export function searchExpenses(gastos: Gasto[], searchTerm: string): Gasto[] {
  if (!searchTerm.trim()) {
    return gastos;
  }

  const term = searchTerm.toLowerCase().trim();

  return gastos.filter((gasto) => {
    // Buscar en UUID (si es XML)
    if (gasto.tipoOrigen === 'XML' && 'uuid' in gasto) {
      if (gasto.uuid?.toLowerCase().includes(term)) {
        return true;
      }
    }

    // Buscar en ID (si es manual)
    if (gasto.id.toLowerCase().includes(term)) {
      return true;
    }

    // Buscar en RFC Emisor (si es XML)
    if (gasto.tipoOrigen === 'XML' && 'rfcEmisor' in gasto) {
      if (gasto.rfcEmisor?.toLowerCase().includes(term)) {
        return true;
      }
    }

    // Buscar en Nombre Emisor (si es XML)
    if (gasto.tipoOrigen === 'XML' && 'nombreEmisor' in gasto) {
      if (gasto.nombreEmisor?.toLowerCase().includes(term)) {
        return true;
      }
    }

    // Buscar en Concepto
    if (gasto.concepto?.toLowerCase().includes(term)) {
      return true;
    }

    return false;
  });
}

