import { useEffect, useState } from 'react';

/**
 * usePersistentState
 * useState con persistencia en localStorage.
 * - Inicializa el estado leyendo desde localStorage (si existe y es JSON válido).
 * - Cada vez que el estado cambia, guarda automáticamente en localStorage.
 *
 * @param {string} key      Clave usada en localStorage
 * @param {*} initial       Valor inicial si no hay nada guardado (o el JSON es inválido)
 * @returns {[any, Function]}  [state, setState] igual que useState
 */
export default function usePersistentState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      // Intenta leer y parsear el valor persistido
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      // Si hay error (JSON inválido o acceso fallido), usa el valor inicial
      return initial;
    }
  });

  useEffect(() => {
    try {
      // Sincroniza cambios del estado hacia localStorage
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // En ambientes sin localStorage (SSR) o con cuota llena, evitamos romper la app
      // Podés loguear el error si te interesa diagnosticar
    }
    // Se ejecuta cada vez que cambie la clave o el estado
  }, [key, state]);

  return [state, setState];
}
