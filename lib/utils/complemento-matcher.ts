/**
 * Utilidades para hacer match entre complementos de pago y facturas PPD
 */

import type { CFDI, RelacionComplemento } from '@/lib/types';

/**
 * Busca facturas PPD que coincidan con un complemento de pago
 * @param complemento Complemento de pago
 * @param facturasPPD Lista de facturas PPD
 * @param mes Mes para filtrar (opcional)
 * @param año Año para filtrar (opcional)
 * @returns Facturas PPD que hacen match
 */
export function buscarMatchesComplemento(
  complemento: CFDI,
  facturasPPD: CFDI[],
  mes?: number,
  año?: number
): CFDI[] {
  if (!complemento.complementoPago) {
    return [];
  }

  const uuidRelacionado = complemento.complementoPago.uuidRelacionado;

  // Filtrar facturas PPD por mes/año si se especifica
  let facturasFiltradas = facturasPPD;
  if (mes !== undefined && año !== undefined) {
    facturasFiltradas = facturasPPD.filter(
      (factura) => factura.mes === mes && factura.año === año
    );
  }

  // Buscar facturas que coincidan con el UUID relacionado
  const matches = facturasFiltradas.filter(
    (factura) => factura.uuid === uuidRelacionado
  );

  return matches;
}

/**
 * Crea una relación entre complemento y factura PPD
 * @param complemento Complemento de pago
 * @param factura Factura PPD
 * @returns Relación creada
 */
export function crearRelacionComplemento(
  complemento: CFDI,
  factura: CFDI
): RelacionComplemento {
  return {
    complementoUUID: complemento.uuid,
    facturaUUID: factura.uuid,
    fechaRelacion: new Date(),
    montoRelacionado: complemento.complementoPago?.monto || complemento.total,
    verificado: true,
  };
}

/**
 * Busca todos los complementos de pago que tienen match con facturas PPD
 * @param complementos Lista de complementos de pago
 * @param facturasPPD Lista de facturas PPD
 * @param mes Mes para filtrar (opcional)
 * @param año Año para filtrar (opcional)
 * @returns Array de relaciones encontradas
 */
export function encontrarTodosLosMatches(
  complementos: CFDI[],
  facturasPPD: CFDI[],
  mes?: number,
  año?: number
): RelacionComplemento[] {
  const relaciones: RelacionComplemento[] = [];

  for (const complemento of complementos) {
    const matches = buscarMatchesComplemento(complemento, facturasPPD, mes, año);
    
    for (const factura of matches) {
      relaciones.push(crearRelacionComplemento(complemento, factura));
    }
  }

  return relaciones;
}

/**
 * Encuentra complementos de pago sin match
 * @param complementos Lista de complementos de pago
 * @param facturasPPD Lista de facturas PPD
 * @param mes Mes para filtrar (opcional)
 * @param año Año para filtrar (opcional)
 * @returns Complementos sin match
 */
export function encontrarComplementosSinMatch(
  complementos: CFDI[],
  facturasPPD: CFDI[],
  mes?: number,
  año?: number
): CFDI[] {
  return complementos.filter((complemento) => {
    const matches = buscarMatchesComplemento(complemento, facturasPPD, mes, año);
    return matches.length === 0;
  });
}

/**
 * Encuentra facturas PPD sin complemento de pago
 * @param facturasPPD Lista de facturas PPD
 * @param complementos Lista de complementos de pago
 * @param mes Mes para filtrar (opcional)
 * @param año Año para filtrar (opcional)
 * @returns Facturas PPD sin complemento
 */
export function encontrarFacturasPPDSinComplemento(
  facturasPPD: CFDI[],
  complementos: CFDI[],
  mes?: number,
  año?: number
): CFDI[] {
  // Filtrar facturas por mes/año si se especifica
  let facturasFiltradas = facturasPPD;
  if (mes !== undefined && año !== undefined) {
    facturasFiltradas = facturasPPD.filter(
      (factura) => factura.mes === mes && factura.año === año
    );
  }

  // Crear un Set de UUIDs de facturas que tienen complemento
  const uuidsConComplemento = new Set<string>();
  for (const complemento of complementos) {
    if (complemento.complementoPago) {
      uuidsConComplemento.add(complemento.complementoPago.uuidRelacionado);
    }
  }

  // Filtrar facturas que no tienen complemento
  return facturasFiltradas.filter(
    (factura) => !uuidsConComplemento.has(factura.uuid)
  );
}

