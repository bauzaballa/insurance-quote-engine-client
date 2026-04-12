// src/services/quotation.js
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v2';

export async function startBackgroundQuote({ vehicle, location, user }) {
  if (
    !vehicle?.marca ||
    !vehicle?.modelo ||
    !vehicle?.version ||
    !vehicle?.anio ||
    !vehicle?.codInfoAuto
  ) {
    throw new Error('Datos de vehículo incompletos');
  }

  if (!location?.provincia || (!location?.municipio && !location?.localidad)) {
    throw new Error('Datos de ubicación incompletos');
  }

  const payload = {
    vehicle: {
      year: Number(vehicle.anio) || 0,
      brandName: String(vehicle.marca).trim(),
      modelName: String(vehicle.modelo).trim(),
      versionName: String(vehicle.version).trim(),
      versionId: Number(vehicle.codInfoAuto) || 0,
    },
    location: {
      provinceName: String(location.provincia).trim(),
      city: String(location.municipio || location.localidad).trim(),
      postalCode: String(location.codigoPostal || '').trim(),
    },
    user: {
      nombre: String(user?.nombre || '').trim(),
      email: String(user?.email || '').trim(),
      telefono: String(user?.telefono || '').trim(),
      edad: Number(user?.edad) || 0,
    },
  };

  if (payload.vehicle.year <= 0 || payload.vehicle.versionId <= 0) {
    throw new Error('Año o código de vehículo inválido');
  }

  const { data } = await axios.post(`${API}/quotation/start`, payload);
  return data;
}

export async function startSanCristobalQuote({ vehicle, location, user }, quoteId) {
  if (!quoteId) {
    throw new Error('quoteId es requerido');
  }

  const payload = {
    vehicle: {
      year: Number(vehicle.anio || vehicle.year) || 0,
      brandName: String(vehicle.marca || vehicle.brandName).trim(),
      modelName: String(vehicle.modelo || vehicle.modelName).trim(),
      versionName: String(vehicle.version || vehicle.versionName).trim(),
      versionId: Number(vehicle.codInfoAuto || vehicle.versionId) || 0,
    },
    location: {
      provinceName: String(location.provincia || location.provinceName).trim(),
      city: String(location.localidad || location.municipio || location.city).trim(),
      postalCode: String(location.codigoPostal || location.postalCode || '').trim(),
    },
    user: {
      nombre: String(user?.nombre || '').trim(),
      email: String(user?.email || '').trim(),
      telefono: String(user?.telefono || '').trim(),
      edad: String(user?.edad || '').trim(),
    },
  };

  const { data } = await axios.post(
    `${API}/quotation/start-san-cristobal?quoteId=${quoteId}`,
    payload
  );
  return data;
}

export async function getQuoteStatus(quoteId) {
  if (!quoteId) {
    throw new Error('quoteId es requerido');
  }

  const { data } = await axios.get(`${API}/quotation/status`, { params: { quoteId } });
  return data;
}

export async function waitForQuoteResults(quoteId, { intervalMs = 1000, timeoutMs = 30000 } = {}) {
  if (!quoteId) {
    throw new Error('quoteId es requerido');
  }

  const t0 = Date.now();
  let res;

  res = await getQuoteStatus(quoteId);
  if (res?.done) return res;

  while (Date.now() - t0 < timeoutMs) {
    await new Promise(r => setTimeout(r, intervalMs));
    try {
      res = await getQuoteStatus(quoteId);
      if (res?.done) return res;
    } catch {
      // ignore
    }
  }

  return res || { done: false, results: [] };
}

function createPlansToCols(norm, toNumber, minPut) {
  return plans => {
    const cols = { rc: null, total: null, clasicos: null, premium: null, tr: null };

    (plans || []).forEach(p => {
      const val = toNumber(p?.planValue);
      if (val == null) return;

      const section = p?.section ? norm(p.section) : '';
      const columnName = p?.columnName ? norm(p.columnName) : '';

      if (section) {
        if (section.startsWith('rc')) {
          minPut(cols, 'rc', val);
          return;
        }
        if (section.includes('todoriesgo') || section.includes('todo riesgo')) {
          minPut(cols, 'tr', val);
          return;
        }
        if (section.startsWith('terceros')) {
          if (columnName === 'premium') minPut(cols, 'premium', val);
          else if (columnName === 'clasicos') minPut(cols, 'clasicos', val);
          else if (columnName === 'total' || columnName === 'plus' || columnName === 'full')
            minPut(cols, 'total', val);
          else minPut(cols, 'clasicos', val);
          return;
        }
      }

      const name = norm(p?.planName);
      const has = t => name.includes(t);
      const any = (...ts) => ts.some(t => has(t));

      if (has('todo riesgo')) {
        minPut(cols, 'tr', val);
        return;
      }

      if (has('terceros')) {
        if (any('premium', 'black', 'platinum', 'full')) {
          minPut(cols, 'premium', val);
          return;
        }
        if (any('total', 'plus', 'full')) {
          minPut(cols, 'total', val);
          return;
        }
        minPut(cols, 'clasicos', val);
        return;
      }

      if (
        (has('responsabilidad civil') || name.startsWith('rc')) &&
        !any('robo', 'hurto', 'incend', 'accid', 'parcial', 'total')
      ) {
        minPut(cols, 'rc', val);
        return;
      }

      if (any('premium', 'black', 'platinum')) minPut(cols, 'premium', val);
      else if (any('total', 'plus', 'full')) minPut(cols, 'total', val);
      else if (any('rc', 'rcl', 'responsabilidad civil')) minPut(cols, 'clasicos', val);
    });

    return cols;
  };
}

export async function getQuotationRows(quote, LOGOS = {}) {
  const norm = s =>
    String(s || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const toNumber = x => {
    if (typeof x === 'number') return Number.isFinite(x) ? x : null;
    const n = Number(String(x).replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const minPut = (bucket, k, v) => {
    if (v == null) return;
    if (bucket[k] == null || v < bucket[k]) bucket[k] = v;
  };

  const plansToCols = createPlansToCols(norm, toNumber, minPut);

  if (quote?.quoteId) {
    const status = await waitForQuoteResults(quote.quoteId, { intervalMs: 800, maxMs: 20000 });
    const list = Array.isArray(status?.results) ? status.results : [];

    return list.map(item => {
      const company = (item?.company ?? item?.insurance ?? item?.provider ?? '').toString().trim();
      const cols = plansToCols(item?.coveragePlans, company);
      return {
        company,
        cols,
        logo: LOGOS[company] ?? item?.logo ?? null,
      };
    });
  }

  return [];
}

export function createProgressiveQuotePoller(
  quoteId,
  onUpdate,
  { intervalMs = 1000, maxTimeMs = 30000 } = {}
) {
  let isActive = true;
  let timeoutId;
  const startTime = Date.now();

  const poll = async () => {
    if (!isActive) return;

    try {
      const status = await getQuoteStatus(quoteId);

      if (isActive) {
        onUpdate(status);

        // Solo detener si done:true (todos los providers tienen respuesta o error)
        if (status?.done || Date.now() - startTime > maxTimeMs) {
          isActive = false;
          return;
        }

        timeoutId = setTimeout(poll, intervalMs);
      }
    } catch {
      if (isActive) {
        timeoutId = setTimeout(poll, intervalMs);
      }
    }
  };

  poll();

  return () => {
    isActive = false;
    if (timeoutId) clearTimeout(timeoutId);
  };
}

export async function sendQuotationEmail(quoteId, user) {
  if (!quoteId || !user) {
    throw new Error('quoteId y user son requeridos');
  }

  const { data } = await axios.post(`${API}/quotation/email`, { quoteId, user });
  return data;
}

export function processProgressiveResults(statusData, LOGOS = {}) {
  const norm = s =>
    String(s || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const toNumber = x => {
    if (typeof x === 'number') return Number.isFinite(x) ? x : null;
    const n = Number(String(x).replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const minPut = (bucket, k, v) => {
    if (v == null) return;
    if (bucket[k] == null || v < bucket[k]) bucket[k] = v;
  };

  const plansToCols = createPlansToCols(norm, toNumber, minPut);
  const results = Array.isArray(statusData?.results) ? statusData.results : [];

  return results.map(item => {
    const company = (item?.company ?? item?.insurance ?? item?.provider ?? '').toString().trim();
    const cols = plansToCols(item?.coveragePlans, company);
    return {
      company,
      cols,
      logo: LOGOS[company] ?? item?.logo ?? null,
      isComplete: true,
    };
  });
}
