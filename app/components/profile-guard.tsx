/**
 * Componente que verifica si el perfil del cliente está configurado
 * y muestra un mensaje si no lo está
 */

'use client';

import { useProfileGuard } from '@/lib/hooks/use-profile-guard';
import { Button } from '@/components/ui/button';
import { AlertCircle, Settings, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProfileGuardProps {
  /**
   * Si es true, solo muestra advertencia pero permite continuar
   * Si es false, bloquea completamente la funcionalidad
   */
  warnOnly?: boolean;
  /**
   * Mensaje personalizado a mostrar
   */
  customMessage?: string;
  /**
   * Si es true, muestra como banner en la parte superior
   * Si es false, muestra como card completo
   */
  asBanner?: boolean;
  /**
   * Tipo de validación: 'required' requiere perfil, 'recommended' solo advierte
   */
  mode?: 'required' | 'recommended';
}

export function ProfileGuard({
  warnOnly = false,
  customMessage,
  asBanner = false,
  mode = 'required',
}: ProfileGuardProps) {
  const { hasProfile, isValid, canUpload, message, profile } = useProfileGuard();

  // Si está en modo 'recommended' y hay perfil, no mostrar nada
  if (mode === 'recommended' && hasProfile && isValid) {
    return null;
  }

  // Si está en modo 'required' y todo está bien, no mostrar nada
  if (mode === 'required' && canUpload) {
    return null;
  }

  // Si está en modo 'recommended' y no hay perfil, mostrar advertencia
  if (mode === 'recommended' && !hasProfile) {
    return (
      <div
        className={cn(
          'bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6',
          asBanner && 'mb-4'
        )}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 mb-1">
              Perfil no configurado
            </p>
            <p className="text-sm text-yellow-700 mb-3">
              {customMessage ||
                'Te recomendamos configurar tu perfil para habilitar validaciones automáticas de RFC.'}
            </p>
            <Link href="/settings">
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                <Settings className="h-4 w-4 mr-2" />
                Ir a Configuración
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si está en modo 'required' y no se puede cargar, mostrar bloqueo
  if (mode === 'required' && !canUpload) {
    return (
      <div
        className={cn(
          'bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6',
          asBanner && 'mb-4'
        )}
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-800 mb-2">
              Perfil Requerido
            </h3>
            <p className="text-red-700 mb-4">
              {customMessage ||
                'Debes configurar tu perfil (nombre y RFC) antes de cargar facturas o gastos. Esto es necesario para validar que los archivos XML pertenezcan a tu empresa.'}
            </p>
            <Link href="/settings">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Settings className="h-5 w-5 mr-2" />
                Configurar Perfil Ahora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si hay perfil pero RFC no es válido
  if (hasProfile && !isValid) {
    return (
      <div
        className={cn(
          'bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6',
          asBanner && 'mb-4'
        )}
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-orange-600 shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-orange-800 mb-2">
              RFC Inválido
            </h3>
            <p className="text-orange-700 mb-4">
              El RFC configurado en tu perfil no es válido. Por favor, verifica
              y corrige tu RFC en la configuración.
            </p>
            <Link href="/settings">
              <Button
                variant="outline"
                size="lg"
                className="border-orange-300 text-orange-800 hover:bg-orange-100"
              >
                <Settings className="h-5 w-5 mr-2" />
                Corregir RFC
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Componente que muestra el estado del perfil cuando está configurado correctamente
 */
export function ProfileStatus() {
  const { hasProfile, isValid, profile } = useProfileGuard();

  if (!hasProfile || !isValid) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            Perfil configurado: {profile?.nombre}
          </p>
          <p className="text-xs text-green-600">
            RFC: {profile?.rfc} • Validaciones activas
          </p>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

