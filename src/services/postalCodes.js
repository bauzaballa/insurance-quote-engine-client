// src/services/postalCodes.js
import codigosPostales from '@utils/codigos_postales.json';

/** Normaliza un item a { id, name, label, value, postalCode?, __raw } */
const toOption = (id, name, postalCode = null, raw = null) => ({
  id: String(id ?? ''),
  name: String(name ?? id ?? ''),
  label: String(name ?? id ?? ''),
  value: String(id ?? name ?? ''),
  postalCode: postalCode ? String(postalCode) : null,
  __raw: raw,
});

/**
 * Obtiene todas las provincias disponibles en el archivo de códigos postales
 */
export async function getProvinciasFromPostalCodes() {
  const provincias = Object.keys(codigosPostales);

  return provincias
    .map(provincia => toOption(provincia, provincia, null, { provincia }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
}

/**
 * Obtiene todas las localidades de una provincia específica
 */
export async function getLocalidadesFromPostalCodes(provinciaName) {
  if (!provinciaName || !codigosPostales[provinciaName]) {
    return [];
  }

  const localidades = codigosPostales[provinciaName];

  return Object.entries(localidades)
    .map(([localidad, codigoPostal]) =>
      toOption(localidad, localidad, codigoPostal, {
        provincia: provinciaName,
        localidad,
        codigoPostal,
      })
    )
    .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
}

/**
 * Obtiene el código postal de una localidad específica
 * Retorna null si no encuentra el código (el backend maneja el fallback)
 */
export function getPostalCode(provinciaName, localidadName) {
  if (!provinciaName || !localidadName || !codigosPostales[provinciaName]) {
    return null;
  }

  return codigosPostales[provinciaName][localidadName] || null;
}

/**
 * Busca una localidad por código postal
 */
export function findLocationByPostalCode(postalCode) {
  if (!postalCode) return null;

  for (const [provincia, localidades] of Object.entries(codigosPostales)) {
    for (const [localidad, codigo] of Object.entries(localidades)) {
      if (codigo === String(postalCode)) {
        return {
          provincia,
          localidad,
          postalCode: codigo,
        };
      }
    }
  }

  return null;
}
