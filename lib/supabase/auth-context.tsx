'use client';

/**
 * Contexto de autenticación con Supabase
 * Proporciona el estado de autenticación y funciones de login/logout
 */

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';
import { useRouter } from 'next/navigation';
import { saveProfileToSupabase } from './profiles';
import { normalizarRFC, determinarTipoPersona } from '@/lib/utils/rfc-validator';
import type { ClienteProfile } from '@/lib/types';

interface SignUpProfileData {
  nombre: string;
  rfc: string;
  tipoPersona: 'FISICA' | 'MORAL';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, profileData?: SignUpProfileData) => Promise<{ error: Error | null; data?: { user: User | null } }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Usar useRef para rastrear si ya había una sesión previa (persiste entre renders)
  const hadPreviousSessionRef = useRef(false);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Si hay sesión inicial, marcar que ya había sesión previa
      if (session?.user) {
        hadPreviousSessionRef.current = true;
      }
    });

    // Escuchar cambios de autenticación
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/dashboard', '/upload', '/expenses', '/settings'];
      const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
      const isProtectedRoute = protectedRoutes.some((route) => currentPath.startsWith(route));
      const isAuthRoute = authRoutes.includes(currentPath);
      const isRoot = currentPath === '/';

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirigir después de login/logout
      if (_event === 'SIGNED_IN' && session?.user) {
        // Verificar si el usuario tiene un perfil, si no existe, intentar crearlo
        // Esto es útil cuando el usuario se registra pero el perfil no se creó por problemas de RLS
        // Hacer esto de forma no bloqueante para no retrasar la redirección
        (async () => {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .single();

            if (profileError && profileError.code === 'PGRST116') {
              // No existe el perfil, intentar crearlo con datos mínimos
              // Esto puede pasar si el registro falló al crear el perfil inicialmente
              console.log('Perfil no encontrado para usuario autenticado, creando perfil básico...');
              try {
                // Agregar timeout para evitar que se quede colgado
                const rpcPromise = supabase.rpc('create_or_update_profile', {
                  p_user_id: session.user.id,
                  p_nombre: session.user.email?.split('@')[0] || 'Usuario',
                  p_rfc: '',
                  p_tipo_persona: 'FISICA',
                  p_validaciones_habilitadas: {
                    validarRFCIngresos: false,
                    validarRFCGastos: false,
                    validarMatchesComplementos: false,
                  },
                });

                const timeoutPromise = new Promise((_, reject) => {
                  setTimeout(() => reject(new Error('Timeout')), 5000);
                });

                await Promise.race([rpcPromise, timeoutPromise]);
                console.log('Perfil básico creado exitosamente');
              } catch (createError) {
                console.warn('No se pudo crear perfil automáticamente:', createError);
                // No es crítico, el usuario puede completar su perfil en /settings
              }
            }
          } catch (checkError) {
            console.warn('Error al verificar perfil del usuario:', checkError);
            // No bloquear la redirección por errores de perfil
          }
        })();

        // Solo redirigir si:
        // 1. Es un login real (no había sesión previa) Y estamos en una ruta de auth o en la raíz
        // 2. O si estamos en la raíz
        // NO redirigir si ya estamos en una ruta protegida (es un refresh de sesión)
        const shouldRedirect = !hadPreviousSessionRef.current && (isAuthRoute || isRoot);
        
        if (shouldRedirect) {
          // Obtener URL de redirección de query params o usar dashboard por defecto
          const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
          // Usar window.location para forzar recarga completa y establecer cookies
          // No esperar la verificación del perfil para redirigir
          window.location.href = redirectUrl;
        }
        
        // Marcar que ahora hay una sesión
        hadPreviousSessionRef.current = true;
      } else if (_event === 'SIGNED_OUT') {
        hadPreviousSessionRef.current = false;
        router.push('/auth/login');
      } else if (_event === 'TOKEN_REFRESHED' && session?.user) {
        // Cuando se refresca el token, no hacer nada, solo actualizar el estado
        // Esto evita redirecciones no deseadas cuando cambias de pestaña
        hadPreviousSessionRef.current = true;
      } else if (session?.user) {
        // Si hay sesión en otros eventos (como INITIAL_SESSION), marcar que hay sesión previa
        hadPreviousSessionRef.current = true;
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, profileData?: SignUpProfileData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // Si el registro fue exitoso y hay datos de perfil, crear el perfil
    if (!error && data.user && profileData) {
      try {
        console.log('Intentando crear perfil para usuario:', data.user.id);
        const rfcNormalizado = normalizarRFC(profileData.rfc);
        const tipoPersona = determinarTipoPersona(rfcNormalizado) || profileData.tipoPersona;

        const profile: ClienteProfile = {
          id: data.user.id,
          nombre: profileData.nombre,
          rfc: rfcNormalizado,
          tipoPersona,
          email,
          validacionesHabilitadas: {
            validarRFCIngresos: false,
            validarRFCGastos: false,
            validarMatchesComplementos: false,
          },
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        };

        console.log('Datos del perfil a guardar:', {
          userId: data.user.id,
          nombre: profile.nombre,
          rfc: profile.rfc,
          tipoPersona: profile.tipoPersona,
        });

        await saveProfileToSupabase(profile, data.user.id);
        console.log('Perfil creado exitosamente');
      } catch (profileError) {
        console.error('Error al crear perfil:', profileError);
        console.error('Detalles del error:', {
          message: profileError instanceof Error ? profileError.message : String(profileError),
          stack: profileError instanceof Error ? profileError.stack : undefined,
        });
        // No fallar el registro si falla la creación del perfil
        // El usuario puede completarlo después en /settings
      }
    } else {
      console.warn('No se creará perfil porque:', {
        hasError: !!error,
        hasUser: !!data?.user,
        hasProfileData: !!profileData,
      });
    }

    return { error, data };
  };

  const signOut = async () => {
    // Limpiar stores antes de cerrar sesión
    try {
      const { useInvoiceStore } = await import('@/store/invoice-store');
      const { useExpenseStore } = await import('@/store/expense-store');
      const { useProfileStore } = await import('@/store/profile-store');
      
      useInvoiceStore.getState().clearInvoices();
      useExpenseStore.getState().clearExpenses();
      useProfileStore.getState().clearProfile();
    } catch (error) {
      console.warn('Error al limpiar datos al cerrar sesión:', error);
    }
    
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

