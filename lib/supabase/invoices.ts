/**
 * Funciones para sincronizar facturas con Supabase
 * Convierte entre tipos CFDI (cliente) y tipos de base de datos
 */

import { supabase } from './client';
import type { CFDI } from '@/lib/types';
import { getProfileIdFromAuthId } from './profiles';

/**
 * Convierte un CFDI a formato de base de datos
 */
function cfdiToDb(cfdi: CFDI, userId: string) {
  return {
    user_id: userId,
    uuid: cfdi.uuid,
    fecha: cfdi.fecha.toISOString(),
    mes: cfdi.mes,
    año: cfdi.año,
    total: cfdi.total,
    subtotal: cfdi.subtotal,
    iva: cfdi.iva,
    tipo: cfdi.tipo,
    rfc_emisor: cfdi.rfcEmisor,
    nombre_emisor: cfdi.nombreEmisor,
    rfc_receptor: cfdi.rfcReceptor,
    nombre_receptor: cfdi.nombreReceptor,
    concepto: cfdi.concepto,
    moneda: 'MXN', // Por defecto, se puede extraer del XML si es necesario
    tipo_cambio: 1,
    pagos: cfdi.pagos || null,
    complemento_pago: cfdi.complementoPago || null,
    validacion: cfdi.validacion || null,
  };
}

/**
 * Convierte un registro de base de datos a CFDI
 */
function dbToCfdi(row: {
  uuid: string;
  fecha: string;
  mes: number;
  año: number;
  total: number;
  subtotal: number;
  iva: number;
  tipo: string;
  rfc_emisor: string;
  nombre_emisor: string | null;
  rfc_receptor: string;
  nombre_receptor: string | null;
  concepto: string | null;
  pagos: unknown;
  complemento_pago: unknown;
  validacion: unknown;
}): CFDI {
  return {
    uuid: row.uuid,
    fecha: new Date(row.fecha),
    mes: row.mes,
    año: row.año,
    total: Number(row.total),
    subtotal: Number(row.subtotal),
    iva: Number(row.iva),
    tipo: row.tipo as CFDI['tipo'],
    rfcEmisor: row.rfc_emisor,
    nombreEmisor: row.nombre_emisor || '',
    rfcReceptor: row.rfc_receptor,
    nombreReceptor: row.nombre_receptor || '',
    concepto: row.concepto || '',
    pagos: row.pagos ? (typeof row.pagos === 'string' ? JSON.parse(row.pagos) : row.pagos) : undefined,
    complementoPago: row.complemento_pago
      ? typeof row.complemento_pago === 'string'
        ? JSON.parse(row.complemento_pago)
        : row.complemento_pago
      : undefined,
    validacion: row.validacion
      ? typeof row.validacion === 'string'
        ? JSON.parse(row.validacion)
        : row.validacion
      : undefined,
  };
}

/**
 * Obtiene todas las facturas del usuario desde Supabase
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function fetchInvoicesFromSupabase(authUserId: string): Promise<CFDI[]> {
  // Obtener el profile.id del usuario autenticado
  const profileId = await getProfileIdFromAuthId(authUserId);
  if (!profileId) {
    console.warn('No se encontró perfil para el usuario, retornando array vacío');
    return [];
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', profileId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener facturas de Supabase:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map(dbToCfdi);
}

/**
 * Guarda una factura en Supabase
 * @param cfdi - Factura a guardar
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function saveInvoiceToSupabase(cfdi: CFDI, authUserId: string): Promise<void> {
  console.log('saveInvoiceToSupabase - Iniciando guardado:', {
    uuid: cfdi.uuid,
    authUserId,
  });

  // Obtener el profile.id del usuario autenticado
  const profileId = await getProfileIdFromAuthId(authUserId);
  console.log('saveInvoiceToSupabase - Profile ID obtenido:', profileId);
  
  if (!profileId) {
    const errorMsg = 'No se encontró perfil para el usuario. Debe crear un perfil primero.';
    console.error('saveInvoiceToSupabase - Error:', errorMsg);
    throw new Error(errorMsg);
  }

  const dbData = cfdiToDb(cfdi, profileId);
  console.log('saveInvoiceToSupabase - Datos a insertar:', {
    user_id: dbData.user_id,
    uuid: dbData.uuid,
    tipo: dbData.tipo,
  });

  const { data, error } = await supabase.from('invoices').insert(dbData);

  if (error) {
    console.error('saveInvoiceToSupabase - Error al insertar en Supabase:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  console.log('saveInvoiceToSupabase - Factura guardada exitosamente:', data);
}

/**
 * Elimina una factura de Supabase
 * @param uuid - UUID de la factura a eliminar
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function deleteInvoiceFromSupabase(uuid: string, authUserId: string): Promise<void> {
  // Obtener el profile.id del usuario autenticado
  const profileId = await getProfileIdFromAuthId(authUserId);
  if (!profileId) {
    throw new Error('No se encontró perfil para el usuario.');
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('uuid', uuid)
    .eq('user_id', profileId);

  if (error) {
    console.error('Error al eliminar factura de Supabase:', error);
    throw error;
  }
}

/**
 * Sincroniza facturas desde IndexedDB a Supabase
 * @param invoices - Facturas a sincronizar
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function syncInvoicesToSupabase(invoices: CFDI[], authUserId: string): Promise<void> {
  if (invoices.length === 0) {
    return;
  }

  // Obtener el profile.id del usuario autenticado
  const profileId = await getProfileIdFromAuthId(authUserId);
  if (!profileId) {
    throw new Error('No se encontró perfil para el usuario. Debe crear un perfil primero.');
  }

  // Obtener facturas existentes en Supabase
  const existingInvoices = await fetchInvoicesFromSupabase(authUserId);
  const existingUuids = new Set(existingInvoices.map((inv) => inv.uuid));

  // Filtrar facturas que no están en Supabase
  const invoicesToSync = invoices.filter((inv) => !existingUuids.has(inv.uuid));

  if (invoicesToSync.length === 0) {
    return;
  }

  // Insertar en lotes para mejor performance
  const batchSize = 10;
  for (let i = 0; i < invoicesToSync.length; i += batchSize) {
    const batch = invoicesToSync.slice(i, i + batchSize);
    const dbData = batch.map((cfdi) => cfdiToDb(cfdi, profileId));

    const { error } = await supabase.from('invoices').insert(dbData);

    if (error) {
      console.error('Error al sincronizar facturas a Supabase:', error);
      throw error;
    }
  }
}

/**
 * Sincroniza facturas desde Supabase a IndexedDB (para carga inicial)
 * @param authUserId - ID de autenticación de Supabase (auth.uid())
 */
export async function syncInvoicesFromSupabase(authUserId: string): Promise<CFDI[]> {
  return await fetchInvoicesFromSupabase(authUserId);
}

