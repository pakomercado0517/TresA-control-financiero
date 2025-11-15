/**
 * Hook para verificar si el perfil del cliente está configurado
 * y habilitar/deshabilitar funcionalidades según el estado
 */

import { useProfileStore } from '@/store/profile-store';
import type { ClienteProfile } from '@/lib/types';

export interface ProfileGuardResult {
  hasProfile: boolean;
  profile: ClienteProfile | null;
  isValid: boolean;
  missingFields: string[];
  canUpload: boolean;
  message: string | null;
}

/**
 * Hook que verifica el estado del perfil del cliente
 */
export function useProfileGuard(): ProfileGuardResult {
  const { profile, isRFCValid } = useProfileStore();

  const hasProfile = profile !== null;
  const isValid = isRFCValid();

  // Verificar campos faltantes
  const missingFields: string[] = [];
  if (!profile) {
    missingFields.push('perfil');
  } else {
    if (!profile.nombre) {
      missingFields.push('nombre');
    }
    if (!profile.rfc) {
      missingFields.push('RFC');
    }
    if (!isValid) {
      missingFields.push('RFC válido');
    }
  }

  // Determinar si se puede cargar
  const canUpload = hasProfile && isValid;

  // Mensaje para mostrar
  let message: string | null = null;
  if (!hasProfile) {
    message = 'Debes configurar tu perfil antes de cargar facturas o gastos.';
  } else if (!isValid) {
    message = 'El RFC en tu perfil no es válido. Por favor, verifica tu configuración.';
  }

  return {
    hasProfile,
    profile,
    isValid,
    missingFields,
    canUpload,
    message,
  };
}

