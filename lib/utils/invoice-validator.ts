/**
 * Utilidades para validar facturas (ingresos)
 */

import type { CFDI, EstadoValidacionCFDI } from '@/lib/types';
import { compararRFCs } from './rfc-validator';
import { buscarMatchesComplemento } from './complemento-matcher';

/**
 * Valida una factura de ingreso contra el RFC del cliente
 * @param factura Factura a validar
 * @param rfcCliente RFC del cliente
 * @param validacionesHabilitadas Configuración de validaciones
 * @param facturasPPD Lista de facturas PPD para buscar matches
 * @returns Estado de validación
 */
export function validarFacturaIngreso(
  factura: CFDI,
  rfcCliente: string | null,
  validacionesHabilitadas: {
    validarRFCIngresos: boolean;
    validarMatchesComplementos: boolean;
  },
  facturasPPD: CFDI[] = []
): EstadoValidacionCFDI {
  const estado: EstadoValidacionCFDI = {
    rfcVerificado: false,
    advertencias: [],
    errores: [],
  };

  // Validar RFC del emisor
  if (validacionesHabilitadas.validarRFCIngresos && rfcCliente) {
    const rfcCoincide = compararRFCs(factura.rfcEmisor, rfcCliente);

    if (!rfcCoincide) {
      estado.advertencias.push(
        `El RFC del emisor (${factura.rfcEmisor}) no coincide con tu RFC (${rfcCliente}). Verifica que sea una factura de ingresos correcta.`
      );
    } else {
      estado.rfcVerificado = true;
    }
  } else if (!rfcCliente) {
    estado.advertencias.push(
      'No hay RFC configurado. Configura tu perfil para habilitar validaciones automáticas.'
    );
  } else {
    estado.rfcVerificado = true; // Si las validaciones están deshabilitadas, se considera verificado
  }

  // Validar match de complemento de pago
  if (
    validacionesHabilitadas.validarMatchesComplementos &&
    factura.tipo === 'COMPLEMENTO_PAGO' &&
    factura.complementoPago
  ) {
    const matches = buscarMatchesComplemento(
      factura,
      facturasPPD,
      factura.mes,
      factura.año
    );

    if (matches.length === 0) {
      estado.advertencias.push(
        `No se encontró ninguna factura PPD relacionada con UUID ${factura.complementoPago.uuidRelacionado} en el mismo mes. Verifica que la factura exista o que el complemento corresponda a otro mes.`
      );
    } else {
      // Match encontrado
      estado.advertencias.push(
        `Match encontrado: Este complemento está relacionado con la factura PPD ${matches[0].uuid.substring(0, 8)}...`
      );
    }
  }

  estado.fechaValidacion = new Date();

  return estado;
}

