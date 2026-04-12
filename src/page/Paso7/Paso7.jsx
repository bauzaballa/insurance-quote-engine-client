import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { StepLayout, FormLayout } from '@/layouts';
import { getLocalidadesFromPostalCodes, getPostalCode } from '@/services/postalCodes';
import { startBackgroundQuote } from '@/services/quotation';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';

const valOf = x => (x && typeof x === 'object' ? x.value : (x ?? ''));

const findOptionByValue = (list, v) =>
  (list || []).find(o => String(o?.value ?? o?.id ?? o) === String(valOf(v))) || null;

export function Paso7() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { quote, setLocation, setQuoteId } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();
  const startedRef = useRef(false);

  const [localidades, setLocalidades] = useState([]);
  const [localidad, setLocalidad] = useState('');
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  const locRef = useRef(null);

  // Load localities when province changes
  useEffect(() => {
    const provincia = quote.location.provincia;
    if (!provincia) {
      setLocalidades([]);
      setLocalidad('');
      return;
    }

    let mounted = true;
    (async () => {
      setLoadingLocalidades(true);
      try {
        const opts = await getLocalidadesFromPostalCodes(provincia);
        if (!mounted) return;
        setLocalidades(opts);
      } finally {
        if (mounted) setLoadingLocalidades(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [quote.location.provincia]);

  return (
    <StepLayout isInStep2={true}>
      <FormLayout
        stepActual={2}
        title='Para terminar, necesitamos saber dónde vivís'
        subtitle='¿En qué localidad vivís?'
        tabs={tabs}
        onCloseTab={onCloseTab}
        labelVariant='ubicacion'
      >
        <SearchSelect
          ref={locRef}
          label='¿En qué localidad vivís?'
          value={localidad}
          onChange={val => {
            const opt = findOptionByValue(localidades, val);
            const nombre = opt?.name ?? opt?.label ?? String(valOf(val));

            // Get postal code if we have province and locality
            let codigoPostal = '';
            if (quote.location.provincia && nombre) {
              codigoPostal = getPostalCode(quote.location.provincia, nombre) || '';
            }

            setLocation({
              municipio: nombre,
              localidad: nombre,
              codigoPostal: codigoPostal,
            });

            if (val && val !== '') {
              // Fire background quote (vehicle + location ready, user still empty — same as old Paso1)
              if (!startedRef.current) {
                startedRef.current = true;
                const v = quote.vehicle;
                const readyVehicle =
                  v?.marca &&
                  v?.modelo &&
                  v?.version &&
                  v?.anio &&
                  v?.codInfoAuto &&
                  Number(v?.anio) > 0 &&
                  Number(v?.codInfoAuto) > 0;

                if (readyVehicle) {
                  startBackgroundQuote({
                    vehicle: {
                      ...v,
                      anio: Number(v.anio),
                      codInfoAuto: Number(v.codInfoAuto),
                    },
                    location: {
                      provincia: quote.location.provincia,
                      municipio: nombre,
                      localidad: nombre,
                      codigoPostal: codigoPostal,
                    },
                  })
                    .then(data => {
                      if (data?.quoteId) setQuoteId(data.quoteId);
                    })
                    .catch(err => {
                      console.warn('Error starting background quote:', err.message);
                      startedRef.current = false;
                    });
                }
              }
              navigate(`/${tipoVehiculo}/datos-personales`);
            }
          }}
          options={localidades}
          placeholder='Seleccioná localidad'
          defaultOption={{ label: 'Seleccioná localidad', value: '' }}
          loading={loadingLocalidades}
          disabled={!quote.location.provincia || loadingLocalidades}
          searchPlaceholder='Buscar localidad'
          loadingLabel='Cargando localidades…'
        />
      </FormLayout>
    </StepLayout>
  );
}
