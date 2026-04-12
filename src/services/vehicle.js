// src/services/vehicle.js
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v2';

/**
 * Helper para depurar errores del backend y ver exactamente
 * URL, parámetros, status y body de respuesta cuando falla.
 */
async function safeGet(url, { params }) {
  try {
    return await axios.get(url, { params });
  } catch (err) {
    const e = err?.response;
    console.groupCollapsed(`[API ERROR] GET ${url}`);
    console.log('params:', params);
    console.log('status:', e?.status);
    console.log('data:', e?.data);
    console.groupEnd();
    throw err;
  }
}

/** Normalizadores robustos para distintas formas que puede traer Infoauto */
const pickId = x => x?.id ?? x?.brandId ?? x?.modelId ?? x?.versionId ?? x?.code ?? x?.value;

const pickName = x =>
  x?.name ?? x?.brand ?? x?.model ?? x?.version ?? x?.description ?? String(pickId(x) ?? '');

const toOption = raw => {
  const id = pickId(raw);
  const name = pickName(raw);
  return {
    id, // Usar este en requests (brand_id/model_id)
    name, // Texto humano
    label: String(name), // Interfaz <SearchSelect/>
    value: id ?? name, // value será el id (preferido), si no existe, el name
    __raw: raw, // útil para inspección en consola
  };
};

/**
 * MARCAS
 * GET /infoauto/car-brands?page=&page_size=&year
 */
export async function getMarcas({ year, page = 1, pageSize = 100 } = {}) {
  // ✅ Guard: no llamar si no hay año (evita requests prematuros)
  if (!year) return [];
  const params = { page, page_size: pageSize, year };
  const { data } = await safeGet(`${API}/infoauto/car-brands`, { params });
  const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  return list.map(toOption);
}

/**
 * AÑOS
 * Rango limitado: desde 1995 hasta 2025.
 */
export async function getAnios() {
  const arr = [];
  for (let year = 2025; year >= 1995; year--) {
    arr.push(year);
  }
  return arr.map(y => ({ id: y, name: y, label: String(y), value: y }));
}

/**
 * MODELOS
 * GET /infoauto/car-models?brand_id=&year=&page=&page_size=
 * Con fallback automático a brand_code si el backend usa otro nombre.
 */
export async function getModelos(brandId, year, { page = 1, pageSize = 50 } = {}) {
  // ✅ Guard: se necesitan ambos
  if (!brandId || !year) return [];
  let resp;
  try {
    resp = await safeGet(`${API}/infoauto/car-models`, {
      params: { brand_id: brandId, year, page, page_size: pageSize },
    });
  } catch {
    // 🔁 Algunos backends usan brand_code o brand como parámetro
    resp = await safeGet(`${API}/infoauto/car-models`, {
      params: { brand_code: brandId, year, page, page_size: pageSize },
    });
  }
  const { data } = resp;
  const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  return list.map(toOption);
}

/**
 * VERSIONES
 * GET /infoauto/car-versions?brand_id=&model_id=&year=&page=&page_size=
 * Con fallback automático a model_code si el backend usa otro nombre.
 */
export async function getVersiones(brandId, year, modelId, { page = 1, pageSize = 20 } = {}) {
  // ✅ Guard: se necesitan los tres
  if (!brandId || !year || !modelId) return [];
  let resp;
  try {
    resp = await safeGet(`${API}/infoauto/car-versions`, {
      params: { brand_id: brandId, model_id: modelId, year, page, page_size: pageSize },
    });
  } catch {
    // 🔁 Algunos backends usan model_code o model como parámetro
    resp = await safeGet(`${API}/infoauto/car-versions`, {
      params: { brand_id: brandId, model_code: modelId, year, page, page_size: pageSize },
    });
  }
  const { data } = resp;
  const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  return list.map(toOption);
}
