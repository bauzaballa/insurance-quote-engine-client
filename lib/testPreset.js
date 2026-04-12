// src/lib/testPreset.js
// Debe ejecutarse lo MÁS TEMPRANO posible (antes de flags/contexts)
// Activa con ?test=1 en la URL.

(function applyTestPreset() {
  try {
    const qs = new URLSearchParams(window.location.search);
    const test = qs.get('test');
    if (test === '1' || test === 'true') {
      // 1) Borrar TODO el localStorage
      localStorage.clear();

      // 2) Inyectar el quoteDraft solicitado
      const preset = {
        vehicle: { marca: 'Renault', modelo: 'LOGAN', version: '1.6 16V ZEN L/19', anio: 2025 },
        location: { provincia: 'Buenos Aires', localidad: 'Azul' },
        user: {
          nombre: 'Luciano Nahuel Espinosa',
          email: 'nachuespinosa@gmail.com',
          telefono: '2281414494',
          edad: 28,
        },
      };
      localStorage.setItem('quoteDraft', JSON.stringify(preset));
      // opcional: también podrías forzar USE_MOCKS aquí si lo querés siempre con test
      // localStorage.setItem("USE_MOCKS", "1");
    }
  } catch (e) {
    console.warn('applyTestPreset error:', e);
  }
})();
