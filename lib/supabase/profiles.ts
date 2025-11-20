/**
 * Funciones para sincronizar perfiles con Supabase
 */

import { supabase } from './client';
import type { ClienteProfile, ValidacionesConfig } from '@/lib/types';

/**
 * Convierte un ClienteProfile a formato de base de datos
 */
function profileToDb(profile: ClienteProfile, userId: string) {
  return {
    // id se genera automáticamente en la base de datos
    user_id: userId, // user_id es el ID de autenticación de Supabase (auth.uid())
    nombre: profile.nombre,
    rfc: profile.rfc,
    tipo_persona: profile.tipoPersona,
    validaciones_habilitadas: profile.validacionesHabilitadas,
    // email no se guarda en profiles, está en auth.users
  };
}

/**
 * Convierte un registro de base de datos a ClienteProfile
 */
function dbToProfile(row: {
  id: string;
  user_id: string;
  nombre: string | null;
  rfc: string | null;
  tipo_persona: string | null;
  validaciones_habilitadas: unknown;
  created_at: string;
  updated_at: string;
}): ClienteProfile {
  return {
    id: row.id,
    nombre: row.nombre || '',
    rfc: row.rfc || '',
    tipoPersona: (row.tipo_persona || 'FISICA') as ClienteProfile['tipoPersona'],
    validacionesHabilitadas: ((): ValidacionesConfig => {
      const validaciones = row.validaciones_habilitadas;
      if (
        validaciones &&
        typeof validaciones === 'object' &&
        'validarRFCIngresos' in validaciones &&
        'validarRFCGastos' in validaciones &&
        'validarMatchesComplementos' in validaciones
      ) {
        return validaciones as ValidacionesConfig;
      }
      return {
        validarRFCIngresos: false,
        validarRFCGastos: false,
        validarMatchesComplementos: false,
      };
    })(),
    fechaCreacion: new Date(row.created_at),
    fechaActualizacion: new Date(row.updated_at),
  };
}

/**
 * Obtiene el ID del perfil (profiles.id) dado el ID de autenticación (auth.uid)
 * Útil para obtener el profiles.id que se usa como foreign key en invoices y expenses
 */
export async function getProfileIdFromAuthId(authUserId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', authUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el perfil
      return null;
    }
    console.error('Error al obtener profile ID de Supabase:', error);
    throw error;
  }

  return data?.id || null;
}

/**
 * Obtiene el perfil del usuario desde Supabase
 */
export async function fetchProfileFromSupabase(userId: string): Promise<ClienteProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el perfil
      return null;
    }
    console.error('Error al obtener perfil de Supabase:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return dbToProfile(data);
}

/**
 * Guarda o actualizar un perfil en Supabase
 * Usa una función de base de datos con SECURITY DEFINER para evitar problemas con RLS
 * cuando el usuario no está completamente autenticado (ej: durante registro)
 */
export async function saveProfileToSupabase(profile: ClienteProfile, userId: string): Promise<void> {
  const dbData = profileToDb(profile, userId);

  console.log('saveProfileToSupabase - Datos a guardar:', {
    userId,
    nombre: dbData.nombre,
    rfc: dbData.rfc,
    tipo_persona: dbData.tipo_persona,
    validaciones_habilitadas: dbData.validaciones_habilitadas,
  });

  // Intentar usar la función de base de datos primero (permite crear perfiles sin restricciones RLS)
  // Agregar timeout para evitar que se quede colgado
  console.log('Llamando a función RPC create_or_update_profile...');
  
  try {
    const rpcPromise = supabase.rpc('create_or_update_profile', {
      p_user_id: userId,
      p_nombre: dbData.nombre || null,
      p_rfc: dbData.rfc || null,
      p_tipo_persona: dbData.tipo_persona || null,
      p_validaciones_habilitadas: dbData.validaciones_habilitadas || {},
    });

    // Agregar timeout de 10 segundos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La función RPC tardó más de 10 segundos')), 10000);
    });

    const { data: rpcData, error: functionError } = await Promise.race([
      rpcPromise,
      timeoutPromise,
    ]) as { data: unknown; error: unknown };

    console.log('Resultado de RPC create_or_update_profile:', {
      data: rpcData,
      error: functionError,
    });

    // Verificar si la función retornó un error en el JSON
    if (rpcData && typeof rpcData === 'object' && 'success' in rpcData && !rpcData.success) {
      console.error('La función RPC retornó un error:', rpcData);
      throw new Error(`Error al crear perfil: ${(rpcData as { error?: string }).error || 'Error desconocido'}`);
    }

    // Verificar que se creó exitosamente
    if (rpcData && typeof rpcData === 'object' && 'success' in rpcData && (rpcData as { success: boolean }).success) {
      console.log('Perfil creado/actualizado exitosamente:', {
        profile_id: (rpcData as { profile_id?: string }).profile_id,
        user_id: (rpcData as { user_id?: string }).user_id,
        action: (rpcData as { action?: string }).action,
      });
      return; // Éxito, salir de la función
    }

    if (functionError) {
      // Si falla la función (puede no existir en la BD o hay un error), intentar con upsert normal
      console.warn('Error al usar función create_or_update_profile:', {
        code: (functionError as { code?: string })?.code,
        message: (functionError as { message?: string })?.message,
        details: (functionError as { details?: string })?.details,
        hint: (functionError as { hint?: string })?.hint,
      });
      
      console.log('Intentando upsert normal como fallback...');
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(dbData, { onConflict: 'user_id' }); // user_id es único, se usa para el conflicto

      if (upsertError) {
        console.error('Error al guardar perfil en Supabase (upsert):', {
          code: upsertError.code,
          message: upsertError.message,
          details: upsertError.details,
          hint: upsertError.hint,
        });
        throw new Error(`Error al guardar perfil: ${upsertError.message}`);
      } else {
        console.log('Perfil guardado exitosamente usando upsert');
      }
    } else {
      console.log('Perfil guardado exitosamente usando función RPC');
    }
  } catch (error) {
    // Capturar errores de timeout u otros errores
    console.error('Error en saveProfileToSupabase:', error);
    
    // Intentar fallback con upsert
    console.log('Error capturado, intentando upsert como fallback...');
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(dbData, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Error al guardar perfil en Supabase (upsert fallback):', {
        code: upsertError.code,
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
      });
      throw new Error(`Error al guardar perfil: ${upsertError.message || (error instanceof Error ? error.message : 'Error desconocido')}`);
    } else {
      console.log('Perfil guardado exitosamente usando upsert (fallback)');
    }
  }
}

