'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from '@/store/profile-store';
import { useAuth } from '@/lib/supabase/auth-context';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { validarFormatoRFC, determinarTipoPersona } from '@/lib/utils/rfc-validator';
import type { TipoPersona } from '@/lib/types';

const profileSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  rfc: z
    .string()
    .min(1, 'El RFC es requerido')
    .refine((rfc) => validarFormatoRFC(rfc), {
      message: 'El RFC no tiene un formato válido',
    }),
  tipoPersona: z.enum(['FISICA', 'MORAL']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  validarRFCIngresos: z.boolean(),
  validarRFCGastos: z.boolean(),
  validarMatchesComplementos: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const {
    profile,
    setProfile,
    updateProfile,
    updateValidaciones,
    syncWithSupabase,
    error: storeError,
  } = useProfileStore();
  const { user, loading: authLoading } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rfcTipo, setRfcTipo] = useState<TipoPersona | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: '',
      rfc: '',
      tipoPersona: 'MORAL',
      email: '',
      validarRFCIngresos: true,
      validarRFCGastos: true,
      validarMatchesComplementos: true,
    },
  });

  // Cargar perfil desde Supabase al montar el componente
  useEffect(() => {
    if (!authLoading && user) {
      setIsLoadingProfile(true);
      syncWithSupabase()
        .then(() => {
          setIsLoadingProfile(false);
        })
        .catch((error) => {
          console.error('Error al cargar perfil desde Supabase:', error);
          setIsLoadingProfile(false);
        });
    } else if (!authLoading && !user) {
      setIsLoadingProfile(false);
    }
  }, [user, authLoading, syncWithSupabase]);

  // Cargar perfil existente en el formulario cuando esté disponible
  useEffect(() => {
    if (profile) {
      reset({
        nombre: profile.nombre || '',
        rfc: profile.rfc || '',
        tipoPersona: profile.tipoPersona || 'MORAL',
        email: profile.email || '',
        validarRFCIngresos: profile.validacionesHabilitadas?.validarRFCIngresos ?? false,
        validarRFCGastos: profile.validacionesHabilitadas?.validarRFCGastos ?? false,
        validarMatchesComplementos:
          profile.validacionesHabilitadas?.validarMatchesComplementos ?? false,
      });
      setRfcTipo(profile.tipoPersona);
    }
  }, [profile, reset]);

  // Detectar tipo de persona cuando cambia el RFC
  const rfcValue = watch('rfc');
  useEffect(() => {
    if (rfcValue && validarFormatoRFC(rfcValue)) {
      const tipo = determinarTipoPersona(rfcValue);
      if (tipo) {
        setRfcTipo(tipo);
        setValue('tipoPersona', tipo);
      }
    }
  }, [rfcValue, setValue]);

  const onSubmit = (data: ProfileFormData) => {
    try {
      if (profile) {
        // Actualizar perfil existente
        updateProfile({
          nombre: data.nombre,
          rfc: data.rfc,
          tipoPersona: data.tipoPersona,
          email: data.email || undefined,
          validacionesHabilitadas: {
            validarRFCIngresos: data.validarRFCIngresos,
            validarRFCGastos: data.validarRFCGastos,
            validarMatchesComplementos: data.validarMatchesComplementos,
          },
        });
      } else {
        // Crear nuevo perfil
        setProfile({
          nombre: data.nombre,
          rfc: data.rfc,
          tipoPersona: data.tipoPersona,
          email: data.email || undefined,
          validacionesHabilitadas: {
            validarRFCIngresos: data.validarRFCIngresos,
            validarRFCGastos: data.validarRFCGastos,
            validarMatchesComplementos: data.validarMatchesComplementos,
          },
        });
      }

      setSuccessMessage('Perfil guardado correctamente');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    }
  };

  // Mostrar loading mientras se carga el perfil desde Supabase
  if (isLoadingProfile || authLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil desde la base de datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-900">Perfil del Cliente</h2>
      </div>

      {storeError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Error</p>
            <p className="text-red-600 text-sm">{storeError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos Básicos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Datos Básicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre Completo / Razón Social
              </label>
              <input
                type="text"
                id="nombre"
                {...register('nombre')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Empresa S.A. de C.V."
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="rfc"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                RFC
              </label>
              <input
                type="text"
                id="rfc"
                {...register('rfc')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                placeholder="Ej: ABC123456789"
                maxLength={13}
              />
              {errors.rfc && (
                <p className="mt-1 text-sm text-red-600">{errors.rfc.message}</p>
              )}
              {rfcTipo && (
                <p className="mt-1 text-sm text-gray-500">
                  Tipo: {rfcTipo === 'MORAL' ? 'Persona Moral' : 'Persona Física'}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tipoPersona"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Persona
              </label>
              <select
                id="tipoPersona"
                {...register('tipoPersona')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!!rfcTipo}
              >
                <option value="MORAL">Persona Moral</option>
                <option value="FISICA">Persona Física</option>
              </select>
              {rfcTipo && (
                <p className="mt-1 text-xs text-gray-500">
                  Determinado automáticamente por el RFC
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email (Opcional)
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="ejemplo@empresa.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Configuración de Validaciones */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configuración de Validaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="validarRFCIngresos"
                {...register('validarRFCIngresos')}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="validarRFCIngresos"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Validar RFC en Ingresos
                </label>
                <p className="text-sm text-gray-600">
                  Muestra advertencia si el RFC del emisor no coincide con tu RFC
                  (las facturas aún se pueden cargar)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="validarRFCGastos"
                {...register('validarRFCGastos')}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="validarRFCGastos"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Validar RFC en Gastos
                </label>
                <p className="text-sm text-gray-600">
                  Bloquea la carga de gastos si el RFC del receptor no coincide con
                  tu RFC (previene errores contables)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="validarMatchesComplementos"
                {...register('validarMatchesComplementos')}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="validarMatchesComplementos"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Validar Matches de Complementos
                </label>
                <p className="text-sm text-gray-600">
                  Busca automáticamente facturas PPD relacionadas con complementos de
                  pago y muestra advertencias si no se encuentra match
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {profile && (
              <p className="text-sm text-gray-500">
                Última actualización:{' '}
                {new Date(profile.fechaActualizacion).toLocaleDateString('es-MX')}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar Perfil'}
          </Button>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <p className="text-green-700 text-sm font-medium">{successMessage}</p>
          </div>
        )}
      </form>
    </div>
  );
}

