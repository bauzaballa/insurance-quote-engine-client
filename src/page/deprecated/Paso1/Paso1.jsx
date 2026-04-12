import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@utils/routes';
import { ls } from '@utils/ls';

import SearchSelect from '../../../components/SearchSelect/SearchSelect';

import styles from './Paso1.module.scss';

import StepLayout from '@/layouts/StepLayout/StepLayout';
import { useQuote } from '@/context/QuoteContext';
import btnArrow from '/src/assets/icons/arrow-btn-icon.svg';
import useOpenNextOnLoad from '@/hooks/useOpenNextOnLoad';
import {
  getProvinciasFromPostalCodes,
  getLocalidadesFromPostalCodes,
  getPostalCode,
} from '@/services/postalCodes';
import { startBackgroundQuote } from '@/services/quotation';

const valOf = x => (x && typeof x === 'object' ? x.value : (x ?? ''));

const findOptionByValue = (list, v) =>
  (list || []).find(o => String(o?.value ?? o?.id ?? o) === String(valOf(v))) || null;

// Fallback robusto
const openNext = ref => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ref.current?.open?.();
    });
  });
};

export const Paso1 = () => {
  const navigate = useNavigate();
  const { quote, setLocation, setQuoteId } = useQuote();

  const [provincias, setProvincias] = useState([]);

  // ⬇️ Usar LS solo si venís de VOLVER
  const restoreFromBack = sessionStorage.getItem('restoreFromBack') === '1';
  const canPersistRef = useRef(restoreFromBack);

  const [provincia, setProvincia] = useState(
    restoreFromBack ? (ls.get('selectedProvincia') ?? '') : ''
  );
  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState(
    restoreFromBack ? (ls.get('selectedLocalidad') ?? '') : ''
  );

  useEffect(() => {
    if (restoreFromBack) {
      sessionStorage.removeItem('restoreFromBack');
    } else {
      ls.clearQuoteStep1?.();
    }
  }, []);

  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  const locRef = useRef(null);
  const shouldOpenLocRef = useRef(false);
  useOpenNextOnLoad(loadingLocalidades, shouldOpenLocRef, locRef);

  const prevProvinciaRef = useRef(provincia);
  const lastChangedRef = useRef(null);
  const fetchIdRef = useRef(0);
  const provRef = useRef(null);

  // Carga provincias desde códigos postales
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingProvincias(true);
      try {
        const p = await getProvinciasFromPostalCodes();
        if (!mounted) return;
        setProvincias(p);
      } finally {
        if (mounted) setLoadingProvincias(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Carga localidades cuando cambia provincia
  useEffect(() => {
    let mounted = true;
    const provinciaChanged = prevProvinciaRef.current !== provincia;
    prevProvinciaRef.current = provincia;
    const provValue = valOf(provincia);

    if (!provValue) {
      setLocalidades([]);
      setLocalidad('');
      return () => {
        mounted = false;
      };
    }

    if (provinciaChanged) setLocalidad('');

    const thisId = ++fetchIdRef.current;
    (async () => {
      setLoadingLocalidades(true);
      try {
        const opts = await getLocalidadesFromPostalCodes(provValue);
        if (!mounted || fetchIdRef.current !== thisId) return;

        setLocalidades(opts);

        const saved = canPersistRef.current ? ls.get('selectedLocalidad') || '' : '';
        if (!provinciaChanged && saved && opts.some(o => valOf(o) === saved)) {
          setLocalidad(saved);
        } else if (provinciaChanged) {
          shouldOpenLocRef.current = true;
          if (opts.length > 0) {
            openNext(locRef);
            shouldOpenLocRef.current = false;
          }
        }
      } finally {
        if (mounted && fetchIdRef.current === thisId) setLoadingLocalidades(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [provincia]);

  useEffect(() => {
    if (!canPersistRef.current) return;
    ls.saveQuoteStep1?.({
      provincia: valOf(provincia),
      localidad: valOf(localidad),
    });
  }, [provincia, localidad]);

  const isProvinceValid = !!findOptionByValue(provincias, provincia);
  const isCityValid = !!findOptionByValue(localidades, localidad);
  const canContinue = isProvinceValid && isCityValid;

  // Avance automático cuando ambas están completas (y la última fue localidad)
  useEffect(() => {
    if (isProvinceValid && isCityValid && lastChangedRef.current === 'localidad') {
      // Obtener y guardar el código postal
      const provinciaSeleccionada = findOptionByValue(provincias, provincia);
      const localidadSeleccionada = findOptionByValue(localidades, localidad);

      if (provinciaSeleccionada && localidadSeleccionada) {
        const codigoPostal = getPostalCode(provinciaSeleccionada.name, localidadSeleccionada.name);
        setLocation({
          provincia: provinciaSeleccionada.name,
          localidad: localidadSeleccionada.name,
          codigoPostal: codigoPostal,
        });
      }

      lastChangedRef.current = null;
      navigate(PATHS.paso2);
    }
  }, [
    isProvinceValid,
    isCityValid,
    navigate,
    provincia,
    localidad,
    provincias,
    localidades,
    setLocation,
  ]);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;

    const v = quote?.vehicle ?? {};
    const readyVehicle =
      v?.marca &&
      v?.modelo &&
      v?.version &&
      (v?.anio || v?.anio === 0) &&
      v?.codInfoAuto &&
      Number(v?.anio) > 0 &&
      Number(v?.codInfoAuto) > 0;

    const provinciaNombre = String(
      findOptionByValue(provincias, provincia)?.name ?? provincia ?? ''
    ).trim();
    const localidadNombre = String(
      findOptionByValue(localidades, localidad)?.name ?? localidad ?? ''
    ).trim();
    const readyLocation = provinciaNombre && localidadNombre;

    if (!readyVehicle || !readyLocation) return;

    startedRef.current = true;
    (async () => {
      try {
        const codigoPostal = getPostalCode(provinciaNombre, localidadNombre);
        const data = await startBackgroundQuote({
          vehicle: {
            ...v,
            anio: Number(v.anio),
            codInfoAuto: Number(v.codInfoAuto),
          },
          location: {
            provincia: provinciaNombre,
            municipio: localidadNombre,
            localidad: localidadNombre,
            codigoPostal: codigoPostal,
          },
        });
        if (data?.quoteId) setQuoteId(data.quoteId);
      } catch (error) {
        console.warn('Error starting background quote:', error.message);
        startedRef.current = false;
      }
    })();
  }, [quote?.vehicle, provincia, localidad, provincias, localidades]);

  // Helpers para guardar en contexto IDs + nombres (para payload final del Paso3)
  return (
    <StepLayout
      stepActual={2}
      footer={
        <div className={styles.footerContainer}>
          <button
            className={styles.BtnContinuar}
            onClick={() => {
              sessionStorage.setItem('restoreFromBack', '1');
              navigate(PATHS.paso0);
            }}
          >
            <span className={styles.textButton}>
              VOLVER
              <img src={btnArrow} alt='' className={styles.btnIcon} />
            </span>
          </button>
          <button
            className={`${styles.BtnContinuar} ${!canContinue ? styles.disable : ''}`}
            disabled={!canContinue}
            onClick={() => {
              if (!isProvinceValid) {
                openNext(provRef);
                return;
              }
              if (!isCityValid) {
                openNext(locRef);
                return;
              }

              // Guardar ubicación con código postal antes de navegar
              const provinciaSeleccionada = findOptionByValue(provincias, provincia);
              const localidadSeleccionada = findOptionByValue(localidades, localidad);

              if (provinciaSeleccionada && localidadSeleccionada) {
                const codigoPostal = getPostalCode(
                  provinciaSeleccionada.name,
                  localidadSeleccionada.name
                );
                setLocation({
                  provincia: provinciaSeleccionada.name,
                  localidad: localidadSeleccionada.name,
                  codigoPostal: codigoPostal || '',
                });
              }

              navigate(PATHS.paso2);
            }}
          >
            <span className={styles.textButton}>
              SEGUIR
              <img src={btnArrow} alt='' className={styles.btnIcon} />
            </span>
          </button>
        </div>
      }
    >
      <div className={styles.selectContainer}>
        <h2>Contanos tu ubicación para cotizar con mayor precisión.</h2>

        <div className={styles.selectRow}>
          <SearchSelect
            ref={provRef}
            label='Provincia'
            value={provincia}
            onChange={val => {
              setProvincia(val);
              const opt = findOptionByValue(provincias, val);
              setLocation({
                provincia: opt?.name ?? opt?.label ?? String(valOf(val)),
              });
              lastChangedRef.current = 'provincia';
            }}
            options={provincias}
            placeholder='Provincia'
            defaultOption={{ label: 'Provincia' }}
            loading={loadingProvincias}
            searchPlaceholder='Buscar provincia'
            required
            aria-required='true'
            aria-invalid={!isProvinceValid}
          />

          <SearchSelect
            ref={locRef}
            label='Localidad'
            value={localidad}
            onChange={val => {
              setLocalidad(val);
              const opt = findOptionByValue(localidades, val);
              const nombre = opt?.name ?? opt?.label ?? String(valOf(val));

              // Obtener código postal si tenemos provincia y localidad
              const provinciaSeleccionada = findOptionByValue(provincias, provincia);
              let codigoPostal = '';
              if (provinciaSeleccionada && nombre) {
                codigoPostal = getPostalCode(provinciaSeleccionada.name, nombre) || '';
              }

              setLocation({
                municipio: nombre,
                localidad: nombre,
                codigoPostal: codigoPostal,
              });
              lastChangedRef.current = 'localidad';
            }}
            options={localidades}
            placeholder='Localidad'
            defaultOption={{ label: 'Localidad' }}
            loading={loadingLocalidades}
            disabled={!isProvinceValid || loadingLocalidades}
            searchPlaceholder='Buscar localidad'
            loadingLabel='Cargando localidades…'
            required
            aria-required='true'
            aria-invalid={!isCityValid}
          />
        </div>
      </div>
    </StepLayout>
  );
};

export default Paso1;
