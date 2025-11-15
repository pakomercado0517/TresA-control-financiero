/**
 * Store de Zustand para gestionar el perfil del cliente
 * 
 * Maneja la configuración del cliente y las validaciones
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ClienteProfile,
  ValidacionesConfig,
  TipoPersona,
} from '@/lib/types';
import { idbStorage } from '@/lib/storage/idb-storage';
import { validarFormatoRFC, normalizarRFC, determinarTipoPersona } from '@/lib/utils/rfc-validator';

interface ProfileStoreState {
  profile: ClienteProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface ProfileStoreActions {
  setProfile: (profile: Omit<ClienteProfile, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  updateProfile: (updates: Partial<Omit<ClienteProfile, 'id' | 'fechaCreacion'>>) => void;
  updateValidaciones: (validaciones: Partial<ValidacionesConfig>) => void;
  clearProfile: () => void;
  getRFC: () => string | null;
  getTipoPersona: () => TipoPersona | null;
  isRFCValid: () => boolean;
}

export type ProfileStore = ProfileStoreState & ProfileStoreActions;

/**
 * Store de perfil con persistencia
 */
export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      profile: null,
      isLoading: false,
      error: null,

      /**
       * Establece el perfil del cliente
       */
      setProfile: (profileData): void => {
        // Validar RFC
        if (!validarFormatoRFC(profileData.rfc)) {
          set({
            error: 'El RFC ingresado no tiene un formato válido',
          });
          throw new Error('RFC inválido');
        }

        const rfcNormalizado = normalizarRFC(profileData.rfc);
        const tipoPersona = determinarTipoPersona(rfcNormalizado);

        if (!tipoPersona) {
          set({
            error: 'No se pudo determinar el tipo de persona del RFC',
          });
          throw new Error('Tipo de persona inválido');
        }

        const profile: ClienteProfile = {
          ...profileData,
          id: 'cliente-profile',
          rfc: rfcNormalizado,
          tipoPersona,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        };

        set({
          profile,
          error: null,
        });
      },

      /**
       * Actualiza el perfil del cliente
       */
      updateProfile: (updates): void => {
        const { profile } = get();

        if (!profile) {
          throw new Error('No hay perfil configurado');
        }

        // Si se actualiza el RFC, validarlo
        if (updates.rfc) {
          if (!validarFormatoRFC(updates.rfc)) {
            set({
              error: 'El RFC ingresado no tiene un formato válido',
            });
            throw new Error('RFC inválido');
          }

          const rfcNormalizado = normalizarRFC(updates.rfc);
          const tipoPersona = determinarTipoPersona(rfcNormalizado);

          if (!tipoPersona) {
            set({
              error: 'No se pudo determinar el tipo de persona del RFC',
            });
            throw new Error('Tipo de persona inválido');
          }

          updates.rfc = rfcNormalizado;
          updates.tipoPersona = tipoPersona;
        }

        const updatedProfile: ClienteProfile = {
          ...profile,
          ...updates,
          fechaActualizacion: new Date(),
        };

        set({
          profile: updatedProfile,
          error: null,
        });
      },

      /**
       * Actualiza solo la configuración de validaciones
       */
      updateValidaciones: (validaciones): void => {
        const { profile } = get();

        if (!profile) {
          throw new Error('No hay perfil configurado');
        }

        const updatedProfile: ClienteProfile = {
          ...profile,
          validacionesHabilitadas: {
            ...profile.validacionesHabilitadas,
            ...validaciones,
          },
          fechaActualizacion: new Date(),
        };

        set({
          profile: updatedProfile,
          error: null,
        });
      },

      /**
       * Limpia el perfil
       */
      clearProfile: (): void => {
        set({
          profile: null,
          error: null,
        });
      },

      /**
       * Obtiene el RFC del cliente
       */
      getRFC: (): string | null => {
        const { profile } = get();
        return profile?.rfc || null;
      },

      /**
       * Obtiene el tipo de persona del cliente
       */
      getTipoPersona: (): TipoPersona | null => {
        const { profile } = get();
        return profile?.tipoPersona || null;
      },

      /**
       * Verifica si hay un RFC válido configurado
       */
      isRFCValid: (): boolean => {
        const { profile } = get();
        return profile !== null && validarFormatoRFC(profile.rfc);
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => idbStorage),
      // Convertir fechas de string a Date al leer del storage
      onRehydrateStorage: () => (state) => {
        if (state?.profile) {
          state.profile.fechaCreacion = new Date(
            state.profile.fechaCreacion as unknown as string
          );
          state.profile.fechaActualizacion = new Date(
            state.profile.fechaActualizacion as unknown as string
          );
        }
      },
    }
  )
);

