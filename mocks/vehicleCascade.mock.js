import { useEffect, useState } from 'react';

const MOCK_MARCAS = ['Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Renault'];
const MOCK_AÑOS = Array.from({ length: 15 }, (_, i) => String(2025 - i)); // "2025".."2011"

const MODELOS_BY = {
  Toyota: ['Corolla', 'Yaris', 'Hilux'],
  Volkswagen: ['Gol', 'Polo', 'Amarok'],
  Ford: ['Fiesta', 'Focus', 'Ranger'],
  Chevrolet: ['Onix', 'Cruze', 'S10'],
  Renault: ['Clio', 'Sandero', 'Duster'],
};

const VERSIONES_BY = {
  Corolla: ['XLI', 'XEI', 'SEG'],
  Yaris: ['S', 'XS', 'XL'],
  Hilux: ['DX', 'SR', 'SRV'],
  Gol: ['Trendline', 'Comfortline'],
  Polo: ['Highline', 'Comfortline'],
  Amarok: ['Trendline', 'Highline'],
  Fiesta: ['S', 'SE', 'Titanium'],
  Focus: ['S', 'SE', 'Titanium'],
  Ranger: ['XL', 'XLT', 'Limited'],
  Onix: ['LT', 'LTZ', 'Premier'],
  Cruze: ['LT', 'LTZ', 'Premier'],
  S10: ['LS', 'LT', 'High Country'],
  Clio: ['Auth', 'Confort', 'Privilege'],
  Sandero: ['Life', 'Zen', 'Intens'],
  Duster: ['Zen', 'Intens', 'Iconic'],
};

export default function useVehicleCascadeMock({ delay = 400 } = {}) {
  // estado seleccionado
  const [marca, setMarca] = useState('');
  const [anio, setAnio] = useState('');
  const [modelo, setModelo] = useState('');
  const [version, setVersion] = useState('');

  // catálogos
  const [marcas, setMarcas] = useState([]);
  const [anios, setAnios] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [versiones, setVersiones] = useState([]);

  // loadings
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingVersiones, setLoadingVersiones] = useState(false);

  // inicial: marcas y años
  useEffect(() => {
    setLoadingMarcas(true);
    setTimeout(() => {
      setMarcas(MOCK_MARCAS.map(m => ({ label: m, value: m })));
      setAnios(MOCK_AÑOS.map(a => ({ label: a, value: a })));
      setLoadingMarcas(false);
    }, delay);
  }, [delay]);

  // cuando cambia marca o año => cargar modelos “del back”
  useEffect(() => {
    setModelo('');
    setVersion('');
    setModelos([]);
    setVersiones([]);

    if (!marca || !anio) return;

    setLoadingModelos(true);
    setTimeout(() => {
      const raw = MODELOS_BY[marca] || [];
      setModelos(raw.map(x => ({ label: x, value: x })));
      setLoadingModelos(false);
    }, delay);
  }, [marca, anio, delay]);

  // cuando cambia modelo => cargar versiones “del back”
  useEffect(() => {
    setVersion('');
    setVersiones([]);

    if (!modelo) return;

    setLoadingVersiones(true);
    setTimeout(() => {
      const raw = VERSIONES_BY[modelo] || [];
      setVersiones(raw.map(x => ({ label: x, value: x })));
      setLoadingVersiones(false);
    }, delay);
  }, [modelo, delay]);

  return {
    marca,
    setMarca,
    anio,
    setAnio,
    modelo,
    setModelo,
    version,
    setVersion,
    marcas,
    modelos,
    versiones,
    anios,
    loadingMarcas,
    loadingModelos,
    loadingVersiones,
  };
}
