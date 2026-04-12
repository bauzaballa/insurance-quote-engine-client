// src/utils/ls.js
export const ls = {
  get: (k, fallback = null) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: k => localStorage.removeItem(k),

  // NUEVO: limpiar todos los campos de Paso0
  clearQuoteStep0() {
    this.del('selectedAnio');
    this.del('selectedMarca');
    this.del('selectedModelo');
    this.del('selectedVersion');
  },

  // NUEVO: guardar todo de una vez
  saveQuoteStep0({ anio, marca, modelo, version }) {
    anio ? this.set('selectedAnio', anio) : this.del('selectedAnio');
    marca ? this.set('selectedMarca', marca) : this.del('selectedMarca');
    modelo ? this.set('selectedModelo', modelo) : this.del('selectedModelo');
    version ? this.set('selectedVersion', version) : this.del('selectedVersion');
  },

  clearQuoteStep1() {
    this.del('selectedProvincia');
    this.del('selectedLocalidad');
  },
  saveQuoteStep1({ provincia, localidad }) {
    provincia ? this.set('selectedProvincia', provincia) : this.del('selectedProvincia');
    localidad ? this.set('selectedLocalidad', localidad) : this.del('selectedLocalidad');
  },

  clearQuoteStep2() {
    this.del('userNombre');
    this.del('userEmail');
    this.del('userTelefono');
    this.del('userEdad');
  },
  saveQuoteStep2({ nombre, email, telefono, edad }) {
    nombre ? this.set('userNombre', nombre) : this.del('userNombre');
    email ? this.set('userEmail', email) : this.del('userEmail');
    telefono ? this.set('userTelefono', telefono) : this.del('userTelefono');
    edad ? this.set('userEdad', edad) : this.del('userEdad');
  },
};
