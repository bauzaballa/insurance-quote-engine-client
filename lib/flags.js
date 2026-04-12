// src/lib/flags.js
export const USE_MOCKS = (() => {
  // 1) querystring ?mocks=1|0 (persiste)
  try {
    const qs = new URLSearchParams(window.location.search);
    const qsVal = qs.get('mocks');
    if (qsVal !== null) {
      localStorage.setItem('USE_MOCKS', qsVal);
    }
  } catch {
    // ignore
  }

  // 2) localStorage persistente
  try {
    const stored = localStorage.getItem('USE_MOCKS');
    if (stored !== null) {
      return stored === '1' || stored === 'true';
    }
  } catch {
    // ignore
  }

  // 3) hostname heurística (opcional)
  try {
    const h = window.location.hostname.toLowerCase();
    if (h.startsWith('test.') || h.includes('staging')) return true;
  } catch {
    // ignore
  }

  // 4) kill switch global (ej: window.__USE_MOCKS__ = true)
  if (typeof window !== 'undefined' && '__USE_MOCKS__' in window) {
    return !!window.__USE_MOCKS__;
  }

  // Fallback
  return false;
})();
