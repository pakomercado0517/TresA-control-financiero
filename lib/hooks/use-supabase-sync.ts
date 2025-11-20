/**
 * Hook para sincronizar datos con Supabase cuando el usuario inicia sesión
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { useInvoiceStore } from '@/store/invoice-store';
import { useExpenseStore } from '@/store/expense-store';
import { useProfileStore } from '@/store/profile-store';

/**
 * Hook que sincroniza automáticamente los stores con Supabase cuando el usuario inicia sesión
 * También limpia datos cuando cambia de usuario
 */
export function useSupabaseSync() {
  const { user, loading: authLoading } = useAuth();
  const { syncWithSupabase: syncInvoices, clearInvoices } = useInvoiceStore();
  const { syncWithSupabase: syncExpenses, clearExpenses } = useExpenseStore();
  const { syncWithSupabase: syncProfile, clearProfile } = useProfileStore();
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Si cambió el usuario (o se cerró sesión), limpiar datos locales
    if (!authLoading) {
      const currentUserId = user?.id || null;
      
      // Si había un usuario anterior y ahora es diferente (o no hay usuario)
      if (previousUserIdRef.current !== null && previousUserIdRef.current !== currentUserId) {
        // Limpiar stores del usuario anterior
        clearInvoices();
        clearExpenses();
        clearProfile();
      }
      
      previousUserIdRef.current = currentUserId;
    }

    // Solo sincronizar si el usuario está autenticado y no está cargando
    if (!authLoading && user) {
      // Sincronizar todos los stores en paralelo
      Promise.all([
        syncInvoices().catch((error) => {
          console.warn('Error al sincronizar facturas:', error);
        }),
        syncExpenses().catch((error) => {
          console.warn('Error al sincronizar gastos:', error);
        }),
        syncProfile().catch((error) => {
          console.warn('Error al sincronizar perfil:', error);
        }),
      ]);
    } else if (!authLoading && !user) {
      // Si no hay usuario, limpiar todos los stores
      clearInvoices();
      clearExpenses();
      clearProfile();
    }
  }, [user, authLoading, syncInvoices, syncExpenses, syncProfile, clearInvoices, clearExpenses, clearProfile]);
}

