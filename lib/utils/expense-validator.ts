/**
 * Utilidades para validar gastos
 */

import type { GastoXML, EstadoValidacionGasto } from '@/lib/types';
import { compararRFCs } from './rfc-validator';
import { buscarMatchesComplemento } from './complemento-matcher';
import type { CFDI } from '@/lib/types';

/**
 * Valida un gasto contra el RFC del cliente
 * @param gasto Gasto a validar
 * @param rfcCliente RFC del cliente
 * @param validacionesHabilitadas Configuración de validaciones
 * @param facturasPPD Lista de facturas PPD para buscar matches (si el gasto es complemento)
 * @returns Estado de validación
 */
export function validarGasto(
  gasto: GastoXML,
  rfcCliente: string | null,
  validacionesHabilitadas: {
    validarRFCGastos: boolean;
    validarMatchesComplementos: boolean;
  },
  facturasPPD: CFDI[] = []
): EstadoValidacionGasto {
  const estado: EstadoValidacionGasto = {
    rfcVerificado: false,
    advertencias: [],
    errores: [],
  };

  // Validar RFC del receptor (en gastos, el cliente es el receptor)
  if (validacionesHabilitadas.validarRFCGastos && rfcCliente) {
    const rfcCoincide = compararRFCs(gasto.rfcReceptor, rfcCliente);

    if (!rfcCoincide) {
      estado.errores.push(
        `El RFC del receptor (${gasto.rfcReceptor}) no coincide con tu RFC (${rfcCliente}). Este gasto no pertenece a tu empresa y no se puede cargar.`
      );
    } else {
      estado.rfcVerificado = true;
    }
  } else if (!rfcCliente) {
    estado.advertencias.push(
      'No hay RFC configurado. Configura tu perfil para habilitar validaciones automáticas.'
    );
    // Si no hay RFC configurado, permitir carga pero con advertencia
    estado.rfcVerificado = false;
  } else {
    estado.rfcVerificado = true; // Si las validaciones están deshabilitadas
  }

  // Validar match de complemento de pago (si el gasto es un complemento)
  if (
    validacionesHabilitadas.validarMatchesComplementos &&
    gasto.tipo === 'COMPLEMENTO_PAGO' &&
    gasto.complementoPago
  ) {
    // Convertir gasto a CFDI para usar la función de búsqueda
    const gastoComoCFDI: CFDI = {
      uuid: gasto.uuid,
      fecha: gasto.fecha,
      tipo: gasto.tipo,
      total: gasto.total,
      subtotal: gasto.subtotal,
      iva: gasto.iva,
      rfcEmisor: gasto.rfcEmisor,
      nombreEmisor: gasto.nombreEmisor,
      rfcReceptor: gasto.rfcReceptor,
      nombreReceptor: gasto.nombreReceptor,
      concepto: gasto.concepto,
      pagos: gasto.pagos,
      complementoPago: gasto.complementoPago,
      mes: gasto.mes,
      año: gasto.año,
    };

    const matches = buscarMatchesComplemento(
      gastoComoCFDI,
      facturasPPD,
      gasto.mes,
      gasto.año
    );

    if (matches.length === 0) {
      estado.advertencias.push(
        `No se encontró ninguna factura PPD relacionada con UUID ${gasto.complementoPago.uuidRelacionado} en el mismo mes.`
      );
    }
  }

  estado.fechaValidacion = new Date();

  return estado;
}

