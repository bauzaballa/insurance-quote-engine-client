import { createContext, useContext } from 'react';
import usePersistentState from '/src/hooks/usePersistentState';

// Creamos un contexto para compartir datos de la cotización
// entre distintos componentes de la app, sin tener que
// pasarlos como props manualmente.
const QuoteCtx = createContext(null);

/**
 * QuoteProvider
 * Proveedor del contexto de cotización.
 * - Envuelve a la aplicación (o parte de ella) y permite
 *   acceder y modificar los datos de la cotización.
 * - Persiste el estado en localStorage bajo la clave "quoteDraft"
 *   gracias al hook usePersistentState.
 *
 * Estructura inicial del estado `quote`:
 * {
 *   vehicle: { marca, anio, modelo, version },
 *   location:{ provincia, localidad },
 *   user:    { nombre, email, telefono, edad },
 * }
 */
export function QuoteProvider({ children }) {
  // `quote` contiene los datos actuales de la cotización.
  // `setQuote` permite actualizarlos.
  // resetOnDev=true en desarrollo para evitar datos viejos guardados
  const [quote, setQuote] = usePersistentState(
    'quoteDraft',
    {
      vehicle: { marca: '', anio: '', modelo: '', version: '', codInfoAuto: '' },
      location: { provincia: '', localidad: '', codigoPostal: '' },
      user: { nombre: '', email: '', telefono: '', edad: '' },
      quoteId: '',
    },
    process.env.NODE_ENV === 'development'
  ); // Reset automático en desarrollo
  // API expuesta
  const api = {
    quote,
    setQuote,
    setVehicle: p => setQuote(s => ({ ...s, vehicle: { ...s.vehicle, ...p } })),
    setLocation: p => setQuote(s => ({ ...s, location: { ...s.location, ...p } })),
    setUser: p => setQuote(s => ({ ...s, user: { ...s.user, ...p } })),
    setQuoteId: id => setQuote(s => ({ ...s, quoteId: id })),
    reset: () =>
      setQuote({
        vehicle: { marca: '', anio: '', modelo: '', version: '', codInfoAuto: '' },
        location: { provincia: '', localidad: '', codigoPostal: '' },
        user: { nombre: '', email: '', telefono: '', edad: '' },
        quoteId: '',
      }),
    resetUser: () =>
      setQuote(s => ({ ...s, user: { nombre: '', email: '', telefono: '', edad: '' } })),

    // Utilidades para desarrollo
    clearStorage: () => {
      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem('quoteDraft');
        console.log('🗑️ localStorage limpiado para quoteDraft');
      }
    },

    // Getters útiles
    hasData: () => {
      const hasVehicle = Object.values(quote.vehicle).some(v => v && v !== '');
      const hasLocation = Object.values(quote.location).some(v => v && v !== '');
      const hasUser = Object.values(quote.user).some(v => v && v !== '');
      return { vehicle: hasVehicle, location: hasLocation, user: hasUser };
    },
  };

  // Provee el estado y funciones a todos los hijos envueltos
  return <QuoteCtx.Provider value={api}>{children}</QuoteCtx.Provider>;
}

/**
 * useQuote
 * Hook para acceder al contexto de cotización.
 * Se usa en cualquier componente hijo de <QuoteProvider>.
 *
 * Ejemplo:
 * const { quote, setVehicle } = useQuote();
 */
export const useQuote = () => useContext(QuoteCtx);
