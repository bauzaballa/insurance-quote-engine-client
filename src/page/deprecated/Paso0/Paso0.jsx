import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@utils/routes';
import { ls } from '@utils/ls';

import SearchSelect from '../../../components/SearchSelect/SearchSelect';

import styles from './Paso0.module.scss';

import '../../styles/index.css';

import useOpenNextOnLoad from '@/hooks/useOpenNextOnLoad';
import { getMarcas, getAnios, getModelos, getVersiones } from '@/services/vehicle';
import StepLayout from '@/layouts/StepLayout/StepLayout';
import { useQuote } from '@/context/QuoteContext';

import btnArrow from '/src/assets/icons/arrow-btn-icon.svg';

const valOf = x => (x && typeof x === 'object' ? x.value : (x ?? ''));

const findOptionByValue = (list, v) =>
  (list || []).find(o => String(o?.value ?? o?.id ?? o) === String(valOf(v))) || null;

// Fallback robusto: abre en el siguiente “paint”
const openNext = ref => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ref.current?.open?.();
    });
  });
};

export const Paso0 = () => {
  const navigate = useNavigate();
  const { setVehicle } = useQuote();

  // Flag efímero: ¿venimos de "VOLVER"?
  const restoreFromBack = sessionStorage.getItem('restoreFromBack') === '1';
  const canPersistRef = React.useRef(restoreFromBack);

  // 🚫 No usamos "quote.vehicle.*" para inicializar, solo LS si venimos de VOLVER
  const [anio, setAnio] = React.useState(restoreFromBack ? (ls.get('selectedAnio') ?? '') : '');
  const [marca, setMarca] = React.useState(restoreFromBack ? (ls.get('selectedMarca') ?? '') : '');
  const [modelo, setModelo] = React.useState(
    restoreFromBack ? (ls.get('selectedModelo') ?? '') : ''
  );
  const [version, setVersion] = React.useState(
    restoreFromBack ? (ls.get('selectedVersion') ?? '') : ''
  );

  const [marcas, setMarcas] = React.useState([]);
  const [anios, setAnios] = React.useState([]);
  const [modelos, setModelos] = React.useState([]);
  const [versiones, setVersiones] = React.useState([]);

  const [loadingMarcas, setLoadingMarcas] = React.useState(false);
  const [loadingModelos, setLoadingModelos] = React.useState(false);
  const [loadingVersiones, setLoadingVersiones] = React.useState(false);

  // NUEVO: ref para abrir Marca luego de elegir Año
  const marcaRef = React.useRef(null);
  const anioRef = React.useRef(null);
  const modeloRef = React.useRef(null);
  const versionRef = React.useRef(null);

  const shouldOpenMarcaRef = React.useRef(false);
  const shouldOpenModeloRef = React.useRef(false);
  const shouldOpenVersionRef = React.useRef(false);
  const lastChangedRef = React.useRef(null);

  useOpenNextOnLoad(loadingModelos, shouldOpenModeloRef, modeloRef);
  useOpenNextOnLoad(loadingVersiones, shouldOpenVersionRef, versionRef);

  const desiredRef = React.useRef({
    marca,
    anio,
    modelo,
    version,
  });

  React.useEffect(() => {
    if (restoreFromBack) {
      // Consumimos el flag para que no "sangre" a otras navegaciones
      sessionStorage.removeItem('restoreFromBack');
    } else {
      // Recotizar / refresh / entrada directa => limpiar LS del Paso0
      ls.clearQuoteStep0();
    }
  }, []);

  // === 1) Cargar SOLO AÑOS al inicio ===
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const a = await getAnios();
        if (!mounted) return;
        setAnios(a);

        // Si ya hay año guardado, pedimos marcas filtradas por ese año
        const aVal = valOf(desiredRef.current.anio);
        if (aVal) {
          setLoadingMarcas(true);
          const ms = await getMarcas({ year: aVal, pageSize: 100 });
          if (!mounted) return;
          setMarcas(ms);

          // Rehidratación de marca si existe
          const target = desiredRef.current.marca;
          if (target) {
            const opt = findOptionByValue(ms, target);
            if (opt) {
              setMarca(target);
              setVehicle({
                marca: opt?.name ?? opt?.label ?? String(valOf(target)),
              });
              desiredRef.current.marca = '';
            }
          }
        } else {
          // Si no hay año, abrimos el select de Año para que el usuario lo elija primero
          // setTimeout(() => anioRef.current?.open?.(), 0);
        }
      } finally {
        if (mounted) setLoadingMarcas(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // === 2) Cuando cambia AÑO: limpiar cascada y cargar MARCAS del año ===
  React.useEffect(() => {
    let mounted = true;
    const a = valOf(anio);

    // Si no hay año, limpiamos y salimos
    if (!a) {
      setMarcas([]);
      setMarca('');
      setModelos([]);
      setModelo('');
      setVersiones([]);
      setVersion('');
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoadingMarcas(true);
      try {
        // Limpiamos hijos
        setMarca('');
        setModelos([]);
        setModelo('');
        setVersiones([]);
        setVersion('');

        // Pedimos marcas filtradas por el año seleccionado
        const ms = await getMarcas({ year: a, pageSize: 100 });
        if (!mounted) return;
        setMarcas(ms);

        // Abrimos MARCA cuando ya tenemos opciones
        if (ms.length > 0) {
          shouldOpenMarcaRef.current = false;
          openNext(marcaRef);
        } else {
          shouldOpenMarcaRef.current = true;
        }
      } finally {
        if (mounted) setLoadingMarcas(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [anio]);

  // === 3) Cargar MODELOS cuando hay marca+anio y la marca existe en la lista actual ===
  React.useEffect(() => {
    let mounted = true;

    const a = valOf(anio);
    const m = valOf(marca);

    // Debe existir la marca seleccionada dentro de `marcas` actuales
    const selectedBrandOpt = (marcas || []).find(o => String(valOf(o)) === String(m));

    if (!a || !m || !selectedBrandOpt) {
      setModelos([]);
      setModelo('');
      setVersiones([]);
      setVersion('');
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoadingModelos(true);
      try {
        // ✅ Usar SIEMPRE el id/código de Infoauto
        const mods = await getModelos(selectedBrandOpt.id, a);
        const arr = Array.isArray(mods) ? mods : [];
        if (!mounted) return;

        setModelos(arr);

        // Rehidratación de modelo (si venía de LS/Context)
        const target = desiredRef.current.modelo;
        if (target) {
          const opt = findOptionByValue(arr, target);
          if (opt) {
            setModelo(target);
            setVehicle({
              modelo: opt?.name ?? opt?.label ?? String(valOf(target)),
            });
            shouldOpenVersionRef.current = false;
            desiredRef.current.modelo = '';
          }
        } else if (shouldOpenModeloRef.current && arr.length > 0) {
          openNext(modeloRef);
          shouldOpenModeloRef.current = false;
        }
      } catch {
        // Evitá "Uncaught (in promise)" si el back responde 500
        if (!mounted) return;
        setModelos([]);
        setModelo('');
        setVersiones([]);
        setVersion('');
      } finally {
        if (mounted) setLoadingModelos(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // 👇 importante: dependemos de `marcas` también
  }, [marca, anio, marcas, setVehicle]);

  // === 4) Cargar VERSIONES cuando hay modelo (y existe en lista actual) ===
  React.useEffect(() => {
    let mounted = true;

    const a = valOf(anio);
    const m = valOf(marca);
    const modVal = valOf(modelo);

    const selectedBrandOpt = (marcas || []).find(o => String(valOf(o)) === String(m));
    const selectedModelOpt = modelos.find(o => String(valOf(o)) === String(modVal));

    if (!a || !m || !modVal || !selectedBrandOpt || !selectedModelOpt) {
      setVersiones([]);
      setVersion('');
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoadingVersiones(true);
      try {
        // ✅ Pasar id de marca (no el string) + id de modelo
        const vers = await getVersiones(selectedBrandOpt.id, a, selectedModelOpt.id);
        const arr = Array.isArray(vers) ? vers : [];
        if (!mounted) return;

        setVersiones(arr);

        // Rehidratación de versión
        const target = desiredRef.current.version;
        if (target) {
          const opt = findOptionByValue(arr, target);
          if (opt) {
            setVersion(target);
            setVehicle({
              version: opt?.name ?? opt?.label ?? String(valOf(target)),
              codInfoAuto: opt?.id ?? opt?.value ?? valOf(target),
            });
            desiredRef.current.version = '';
          }
        } else if (shouldOpenVersionRef.current && arr.length > 0) {
          openNext(versionRef);
          shouldOpenVersionRef.current = false;
        }
      } catch {
        if (!mounted) return;
        setVersiones([]);
        setVersion('');
      } finally {
        if (mounted) setLoadingVersiones(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [marca, anio, modelo, marcas, modelos, setVehicle]);

  React.useEffect(() => {
    if (!canPersistRef.current) return;
    ls.saveQuoteStep0({
      anio: valOf(anio),
      marca: valOf(marca),
      modelo: valOf(modelo),
      version: valOf(version),
    });
  }, [anio, marca, modelo, version]);

  React.useEffect(() => {
    const ok = valOf(marca) && valOf(anio) && valOf(modelo) && valOf(version);
    if (ok && lastChangedRef.current === 'version') {
      lastChangedRef.current = null;
      navigate(PATHS.paso1);
    }
  }, [marca, anio, modelo, version, navigate]);

  const disabledCotizar = !(valOf(marca) && valOf(anio) && valOf(modelo) && valOf(version));

  return (
    <StepLayout
      stepActual={1}
      footer={
        <button
          className={`${styles.BtnCotizar} ${disabledCotizar ? styles.disable : ''}`}
          disabled={disabledCotizar}
          onClick={() => navigate(PATHS.paso1)}
        >
          <span className={styles.textButton}>
            SEGUIR
            <img src={btnArrow} alt='' className={styles.btnIcon} />
          </span>
        </button>
      }
    >
      <div className={styles.selectContainer}>
        <h2>Ingresá los datos de tu vehículo para realizar la cotización.</h2>

        <div className={styles.selectRow}>
          {/* Año: primero se elige esto */}
          <SearchSelect
            ref={anioRef}
            label='Año'
            value={anio}
            onChange={val => {
              setAnio(val);
              setVehicle({ anio: valOf(val) });
              lastChangedRef.current = 'anio';
              // Cuando termine de cargar MARCAS del año, abrimos Marca
              shouldOpenMarcaRef.current = true;
            }}
            options={anios}
            placeholder='Año'
            defaultOption={{ label: 'Año' }}
            // Año ahora SIEMPRE habilitado
            searchPlaceholder='Buscar año'
          />

          {/* Marca: ahora depende de AÑO */}
          <SearchSelect
            ref={marcaRef}
            label='Marca'
            value={marca}
            onChange={val => {
              setMarca(val);
              const opt = findOptionByValue(marcas, val);
              setVehicle({
                marca: opt?.name ?? opt?.label ?? String(valOf(val)),
              });
              lastChangedRef.current = 'marca';
              shouldOpenModeloRef.current = true;
            }}
            options={marcas}
            placeholder='Seleccioná marca'
            defaultOption={{ label: 'Seleccioná marca' }}
            loading={loadingMarcas}
            disabled={!valOf(anio) || loadingMarcas} // <- deshabilitada hasta elegir año
            searchPlaceholder='Buscar marca'
          />

          <SearchSelect
            ref={modeloRef}
            label='Modelo'
            value={modelo}
            onChange={val => {
              setModelo(val);
              const opt = findOptionByValue(modelos, val);
              setVehicle({
                modelo: opt?.name ?? opt?.label ?? String(valOf(val)),
              });
              lastChangedRef.current = 'modelo';
              shouldOpenVersionRef.current = true;
            }}
            options={modelos}
            placeholder='Modelo'
            defaultOption={{ label: 'Modelo' }}
            disabled={!valOf(marca) || !valOf(anio) || loadingModelos}
            loading={loadingModelos}
            loadingLabel='Cargando modelos…'
            searchPlaceholder='Buscar modelo'
          />

          <SearchSelect
            ref={versionRef}
            label='Versión'
            value={version}
            onChange={val => {
              setVersion(val);
              const opt = findOptionByValue(versiones, val);
              setVehicle({
                version: opt?.name ?? opt?.label ?? String(valOf(val)),
                codInfoAuto: opt?.id ?? valOf(val),
              });
              lastChangedRef.current = 'version';
            }}
            options={versiones}
            placeholder='Versión'
            defaultOption={{ label: 'Versión' }}
            disabled={!valOf(modelo) || loadingVersiones}
            loading={loadingVersiones}
            loadingLabel='Cargando versiones…'
            searchPlaceholder='Buscar versión'
          />
        </div>
      </div>
    </StepLayout>
  );
};

export default Paso0;
