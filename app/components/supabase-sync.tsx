'use client';

import { useSupabaseSync } from '@/lib/hooks/use-supabase-sync';

/**
 * Componente que maneja la sincronización con Supabase
 * Se ejecuta automáticamente cuando el usuario inicia sesión
 */
export function SupabaseSync() {
  useSupabaseSync();
  return null;
}

