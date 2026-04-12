import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import '@/styles/shared/merchi.scss';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { StepLayout, FormLayout } from '@/layouts';
import { getMarcas, getModelos } from '@/services/vehicle';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';
import { MerchiTooltip } from '@/components/ui';

const valOf = x => (x && typeof x === 'object' ? x.value : (x ?? ''));

export function Paso4() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { quote, setVehicle } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();
  const [marcas, setMarcas] = React.useState([]);
  const [modelo, setModelo] = React.useState('');
  const [modelos, setModelos] = React.useState([]);
  const [loadingModelos, setLoadingModelos] = React.useState(false);

  const modeloRef = React.useRef(null);

  // Initialize modelo from context if available
  React.useEffect(() => {
    if (quote.vehicle.modelo && modelos.length > 0) {
      // Find the option that matches the stored modelo name
      const matchingOption = modelos.find(
        opt => (opt?.name ?? opt?.label ?? String(valOf(opt))) === quote.vehicle.modelo
      );
      if (matchingOption) {
        setModelo(valOf(matchingOption));
      }
    }
  }, [quote.vehicle.modelo, modelos]);

  // Load brands if needed to find brand ID for models
  React.useEffect(() => {
    const year = quote.vehicle.anio;
    const brandName = quote.vehicle.marca;
    if (!year || !brandName || marcas.length > 0) return;

    let mounted = true;
    (async () => {
      try {
        const ms = await getMarcas({ year, pageSize: 100 });
        if (!mounted) return;
        setMarcas(ms);
      } catch (error) {
        console.error('Error loading brands:', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [quote.vehicle.anio, quote.vehicle.marca, marcas.length]);

  // Load models when brand and year are available
  React.useEffect(() => {
    const year = quote.vehicle.anio;
    const brandName = quote.vehicle.marca;
    if (!year || !brandName) {
      setModelos([]);
      setModelo('');
      return;
    }

    // Find the selected brand option by name to get its ID
    const selectedBrandOpt = marcas.find(
      o => (o?.name ?? o?.label ?? String(valOf(o))) === brandName
    );
    if (!selectedBrandOpt) {
      setModelos([]);
      setModelo('');
      return;
    }

    let mounted = true;
    (async () => {
      setLoadingModelos(true);
      try {
        const mods = await getModelos(selectedBrandOpt.id, year);
        const arr = Array.isArray(mods) ? mods : [];
        if (!mounted) return;
        setModelos(arr);
      } catch (error) {
        console.error('Error loading models:', error);
        if (!mounted) return;
        setModelos([]);
      } finally {
        if (mounted) setLoadingModelos(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [quote.vehicle.marca, marcas, quote.vehicle.anio]);

  return (
    <StepLayout>
      <FormLayout
        stepActual={1}
        title='Empecemos a buscar el mejor precio de seguro en 3 simples pasos'
        subtitle='Y también indicanos su modelo. '
        tabs={tabs}
        onCloseTab={onCloseTab}
      >
        <SearchSelect
          ref={modeloRef}
          label={`¿Qué modelo es tu ${tipoVehiculo}?`}
          value={modelo}
          onChange={val => {
            const opt = modelos.find(o => String(valOf(o)) === String(valOf(val)));
            setVehicle({
              modelo: opt?.name ?? opt?.label ?? String(valOf(val)),
            });
            if (val && val !== '') {
              navigate(`/${tipoVehiculo}/version`);
            }
          }}
          options={modelos}
          placeholder='Seleccioná modelo'
          defaultOption={{ label: 'Seleccioná modelo', value: '' }}
          loading={loadingModelos}
          disabled={!quote.vehicle.marca || loadingModelos}
          searchPlaceholder='Buscar modelo'
        />
        <div className='tooltipContainer'>
          <MerchiTooltip
            type='greeting'
            text='Cada detalle es importante para encontrar la cobertura correcta.  '
            iconPosition='right'
            tooltipContainer='tooltipContainerContent'
          ></MerchiTooltip>
        </div>
      </FormLayout>
    </StepLayout>
  );
}
