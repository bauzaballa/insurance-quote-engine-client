import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Store de Zustand para el estado de la cotización
 * - Estado global reactivo
 * - Persistencia automática en localStorage
 * - Reset automático en desarrollo
 * - Funciones helper optimizadas
 */
export const useQuoteStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      quote: {
        vehicle: { marca: '', anio: '', modelo: '', version: '', codInfoAuto: '' },
        location: { provincia: '', localidad: '', codigoPostal: '' },
        user: { nombre: '', email: '', telefono: '', edad: '' },
        quoteId: '',
      },

      // Actions - Setters
      setVehicle: data =>
        set(state => ({
          quote: { ...state.quote, vehicle: { ...state.quote.vehicle, ...data } },
        })),

      setLocation: data =>
        set(state => ({
          quote: { ...state.quote, location: { ...state.quote.location, ...data } },
        })),

      setUser: data =>
        set(state => ({
          quote: { ...state.quote, user: { ...state.quote.user, ...data } },
        })),

      setQuoteId: id =>
        set(state => ({
          quote: { ...state.quote, quoteId: id },
        })),

      // Actions - Reset
      reset: () =>
        set(() => ({
          quote: {
            vehicle: { marca: '', anio: '', modelo: '', version: '', codInfoAuto: '' },
            location: { provincia: '', localidad: '', codigoPostal: '' },
            user: { nombre: '', email: '', telefono: '', edad: '' },
            quoteId: '',
          },
        })),

      resetUser: () =>
        set(state => ({
          quote: { ...state.quote, user: { nombre: '', email: '', telefono: '', edad: '' } },
        })),

      resetLocation: () =>
        set(state => ({
          quote: { ...state.quote, location: { provincia: '', localidad: '', codigoPostal: '' } },
        })),

      // Actions - Utilities
      clearStorage: () => {
        if (process.env.NODE_ENV === 'development') {
          localStorage.removeItem('quote-storage');
          console.log('🗑️ Zustand storage limpiado');
          // Reset state immediately
          get().reset();
        }
      },

      // Computed getters
      hasVehicleData: () => {
        const { vehicle } = get().quote;
        return Object.values(vehicle).some(value => value && value !== '');
      },

      hasLocationData: () => {
        const { location } = get().quote;
        return Object.values(location).some(value => value && value !== '');
      },

      hasUserData: () => {
        const { user } = get().quote;
        return Object.values(user).some(value => value && value !== '');
      },

      getCompletedSections: () => {
        const sections = [];
        if (get().hasVehicleData()) sections.push('vehicle');
        if (get().hasLocationData()) sections.push('location');
        if (get().hasUserData()) sections.push('user');
        return sections;
      },

      hasData: () => ({
        vehicle: get().hasVehicleData(),
        location: get().hasLocationData(),
        user: get().hasUserData(),
      }),

      // Getters
      getQuote: () => get().quote,
    }),
    {
      name: 'quote-storage',
      storage: createJSONStorage(() => localStorage),
      // Nota: Removido el reset automático en desarrollo para mantener estado persistente
    }
  )
);
