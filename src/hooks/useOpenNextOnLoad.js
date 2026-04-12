import { useEffect } from 'react';

/**
 * useOpenNextOnLoad
 * Abre un "siguiente paso" (por ejemplo, un modal o un acordeón) cuando:
 * 1) terminó la carga (loading === false) y
 * 2) existe una bandera (shouldOpenRef.current) que indica que debe abrirse.
 *
 * Patrón típico:
 * - `shouldOpenRef` es un ref booleando (mutable) que otro código setea en `true`
 *   cuando quiere que se abra automáticamente apenas deje de cargar.
 * - `nextRef` apunta al componente/instancia que expone un método `.open()`.
 *
 * @param {boolean} loading            Estado de carga: true mientras carga, false cuando finaliza
 * @param {React.MutableRefObject<boolean>} shouldOpenRef  Ref con bandera "debe abrirse"
 * @param {React.MutableRefObject<any>} nextRef           Ref al objeto que tiene un método `.open()`
 */
export default function useOpenNextOnLoad(loading, shouldOpenRef, nextRef) {
  useEffect(() => {
    // Cuando la carga termina y la bandera está activa…
    if (!loading && shouldOpenRef.current) {
      // Resetea la bandera para no abrirlo más de una vez
      shouldOpenRef.current = false;
      // Si existe el ref y el método open, lo llama
      nextRef.current?.open?.();
    }
    // Se vuelve a evaluar cada vez que cambie "loading"
  }, [loading]);
}
