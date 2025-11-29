/**
 * Funciones para sincronizar gastos con Supabase
 */

import { supabase } from './client';
import type { Gasto, GastoXML, GastoManual } from '@/lib/types';
import { getProfileIdFromAuthId } from './profiles';

/**
 * Convierte un Gasto a formato de base de datos
 */
function gastoToDb(gasto: Gasto, userId: string) {
  const base = {
    user_id: userId,
    tipo_origen: gasto.tipoOrigen,
    fecha: gasto.fecha.toISOString(),
    mes: gasto.mes,
    año: gasto.año,
    concepto: 'concepto' in gasto ? gasto.concepto : null,
    categoria: 'categoria' in gasto ? gasto.categoria : null,
  };

  if (gasto.tipoOrigen === 'XML') {
    const gastoXML = gasto as GastoXML;
    return {
      ...base,
      uuid: gastoXML.uuid,
      total: gastoXML.total,
      subtotal: gastoXML.subtotal,
      iva: gastoXML.iva,
      tipo: gastoXML.tipo,
      rfc_emisor: gastoXML.rfcEmisor,
      nombre_emisor: gastoXML.nombreEmisor,
      rfc_receptor: gastoXML.rfcReceptor,
      nombre_receptor: gastoXML.nombreReceptor,
      moneda: 'MXN',
      tipo_cambio: 1,
      pagos: gastoXML.pagos || null,
      complemento_pago: gastoXML.complementoPago || null,
      validacion: gastoXML.validacion || null,
    };
  } else {
    const gastoManual = gasto as GastoManual;
    return {
      ...base,
      uuid: null,
      total: gastoManual.monto,
      subtotal: gastoManual.monto,
      iva: 0,
      tipo: gastoManual.tipo,
      rfc_emisor: null,
      nombre_emisor: null,
      rfc_receptor: null,
      nombre_receptor: null,
      moneda: 'MXN',
      tipo_cambio: 1,
      pagos: null,
      complemento_pago: null,
      validacion: null,
    };
  }
}

/**
 * Convierte un registro de base de datos a Gasto
 */
function dbToGasto(row: {
  id: string;
  tipo_origen: string;
  fecha: string;
  mes: number;
  año: number;
  total: number;
  subtotal: number;
  iva: number;
  concepto: string | null;
  categoria: string | null;
  uuid: string | null;
  tipo: string | null;
  rfc_emisor: string | null;
  nombre_emisor: string | null;
  rfc_receptor: string | null;
  nombre_receptor: string | null;
  pagos: unknown;
  complemento_pago: unknown;
  validacion: unknown;
}): Gasto {
  if (row.tipo_origen === 'XML' && row.uuid) {
    // Parsear pagos y convertir fechas
    let pagos = undefined;
    if (row.pagos) {
      const pagosParsed = typeof row.pagos === 'string' ? JSON.parse(row.pagos) : row.pagos;
      if (Array.isArray(pagosParsed)) {
        pagos = pagosParsed.map((pago: any) => ({
          ...pago,
          fechaPago: pago.fechaPago ? new Date(pago.fechaPago) : new Date(),
        }));
      }
    }

    // Parsear complemento de pago y convertir fecha
    let complementoPago = undefined;
    if (row.complemento_pago) {
      const complementoParsed = typeof row.complemento_pago === 'string'
        ? JSON.parse(row.complemento_pago)
        : row.complemento_pago;
      if (complementoParsed) {
        complementoPago = {
          ...complementoParsed,
          fechaPago: complementoParsed.fechaPago ? new Date(complementoParsed.fechaPago) : new Date(),
        };
      }
    }

    // Parsear validación y convertir fecha si existe
    let validacion = undefined;
    if (row.validacion) {
      const validacionParsed = typeof row.validacion === 'string'
        ? JSON.parse(row.validacion)
        : row.validacion;
      if (validacionParsed) {
        validacion = {
          ...validacionParsed,
          fechaValidacion: validacionParsed.fechaValidacion
            ? new Date(validacionParsed.fechaValidacion)
            : undefined,
        };
      }
    }

    return {
      id: row.id,
      uuid: row.uuid,
      fecha: new Date(row.fecha),
      mes: row.mes,
      año: row.año,
      total: Number(row.total),
      subtotal: Number(row.subtotal),
      iva: Number(row.iva),
      rfcEmisor: row.rfc_emisor || '',
      nombreEmisor: row.nombre_emisor || '',
      rfcReceptor: row.rfc_receptor || '',
      nombreReceptor: row.nombre_receptor || '',
      concepto: row.concepto || '',
      tipo: (row.tipo || 'PUE') as GastoXML['tipo'],
      pagos,
      complementoPago,
      validacion,
      tipoOrigen: 'XML',
    } as GastoXML;
  } else {
    return {
      id: row.id,
      fecha: new Date(row.fecha),
      monto: Number(row.total),
      concepto: row.concepto || '',
      tipo: (row.tipo || 'PUE') as GastoManual['tipo'],
      mes: row.mes,
      año: row.año,
      tipoOrigen: 'MANUAL',
      categoria: row.categoria || undefined,
    } as GastoManual;
  }
}

/**
 * Obtiene todos los gastos del usuario desde Supabase
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function fetchExpensesFromSupabase(authUserId: string): Promise<Gasto[]> {
  // Obtener el profile.id del usuario autenticado
  const profileId = await getProfileIdFromAuthId(authUserId);
  if (!profileId) {
    console.warn('No se encontró perfil para el usuario, retornando array vacío');
    return [];
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', profileId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener gastos de Supabase:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map(dbToGasto);
}

/**
 * Guarda un gasto en Supabase
 * @param gasto - Gasto a guardar
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function saveExpenseToSupabase(gasto: Gasto, authUserId: string): Promise<void> {
  console.log('saveExpenseToSupabase - Iniciando guardado:', {
    id: gasto.id,
    uuid: 'uuid' in gasto ? gasto.uuid : 'N/A',
    authUserId,
  });

  // Obtener el profile.id del usuario autenticado
  const profileId = await getProfileIdFromAuthId(authUserId);
  console.log('saveExpenseToSupabase - Profile ID obtenido:', profileId);
  
  if (!profileId) {
    const errorMsg = 'No se encontró perfil para el usuario. Debe crear un perfil primero.';
    console.error('saveExpenseToSupabase - Error:', errorMsg);
    throw new Error(errorMsg);
  }

  const dbData = gastoToDb(gasto, profileId);
  console.log('saveExpenseToSupabase - Datos a insertar:', {
    user_id: dbData.user_id,
    tipo_origen: dbData.tipo_origen,
    uuid: dbData.uuid,
  });

  const { data, error } = await supabase.from('expenses').insert(dbData);

  if (error) {
    console.error('saveExpenseToSupabase - Error al insertar en Supabase:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  console.log('saveExpenseToSupabase - Gasto guardado exitosamente:', data);
}

/**
 * Elimina un gasto de Supabase
 * @param id - ID del gasto a eliminar
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function deleteExpenseFromSupabase(id: string, authUserId: string): Promise<void> {
  // Obtener el profile.id del usuario autenticado
  const profileId = await getProfileIdFromAuthId(authUserId);
  if (!profileId) {
    throw new Error('No se encontró perfil para el usuario.');
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', profileId);

  if (error) {
    console.error('Error al eliminar gasto de Supabase:', error);
    throw error;
  }
}

/**
 * Sincroniza gastos desde IndexedDB a Supabase
 * @param expenses - Gastos a sincronizar
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function syncExpensesToSupabase(expenses: Gasto[], authUserId: string): Promise<void> {
  if (expenses.length === 0) {
    return;
  }

  // Obtener el profile.id del usuario autenticado
  const profileId = await getProfileIdFromAuthId(authUserId);
  if (!profileId) {
    throw new Error('No se encontró perfil para el usuario. Debe crear un perfil primero.');
  }

  const existingExpenses = await fetchExpensesFromSupabase(authUserId);
  const existingIds = new Set(existingExpenses.map((exp) => exp.id));

  const expensesToSync = expenses.filter((exp) => !existingIds.has(exp.id));

  if (expensesToSync.length === 0) {
    return;
  }

  const batchSize = 10;
  for (let i = 0; i < expensesToSync.length; i += batchSize) {
    const batch = expensesToSync.slice(i, i + batchSize);
    const dbData = batch.map((gasto) => gastoToDb(gasto, profileId));

    const { error } = await supabase.from('expenses').insert(dbData);

    if (error) {
      console.error('Error al sincronizar gastos a Supabase:', error);
      throw error;
    }
  }
}

