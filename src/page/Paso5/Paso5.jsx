import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { StepLayout, FormLayout } from '@/layouts';
import { getMarcas, getModelos, getVersiones } from '@/services/vehicle';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';

const valOf = x => (x && typeof x === 'object' ? x.value : (x ?? ''));

export function Paso5() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { quote, setVehicle } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();
  const [marcas, setMarcas] = React.useState([]);
  const [modelos, setModelos] = React.useState([]);
  const [version, setVersion] = React.useState('');
  const [versiones, setVersiones] = React.useState([]);
  const [loadingVersiones, setLoadingVersiones] = React.useState(false);

  const versionRef = React.useRef(null);

  // Initialize version from context if available
  React.useEffect(() => {
    if (quote.vehicle.version && versiones.length > 0) {
      // Find the option that matches the stored version name
      const matchingOption = versiones.find(
        opt => (opt?.name ?? opt?.label ?? String(valOf(opt))) === quote.vehicle.version
      );
      if (matchingOption) {
        setVersion(valOf(matchingOption));
      }
    }
  }, [quote.vehicle.version, versiones]);

  // Load brands and models if needed to find IDs for versions
  React.useEffect(() => {
    const year = quote.vehicle.anio;
    const brandName = quote.vehicle.marca;
    const modelName = quote.vehicle.modelo;
    if (!year || !brandName || !modelName) return;
    if (marcas.length > 0 && modelos.length > 0) return;

    let mounted = true;
    (async () => {
      try {
        // Load brands first
        if (marcas.length === 0) {
          const ms = await getMarcas({ year, pageSize: 100 });
          if (!mounted) return;
          setMarcas(ms);
        }

        // Load models if we have brands
        if (modelos.length === 0 && marcas.length > 0) {
          const selectedBrandOpt = marcas.find(
            o => (o?.name ?? o?.label ?? String(valOf(o))) === brandName
          );
          if (selectedBrandOpt) {
            const mods = await getModelos(selectedBrandOpt.id, year);
            const arr = Array.isArray(mods) ? mods : [];
            if (!mounted) return;
            setModelos(arr);
          }
        }
      } catch (error) {
        console.error('Error loading brands/models:', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [
    quote.vehicle.anio,
    quote.vehicle.marca,
    quote.vehicle.modelo,
    marcas.length,
    modelos.length,
  ]);

  // Load versions when brand, year, and model are available
  React.useEffect(() => {
    const year = quote.vehicle.anio;
    const brandName = quote.vehicle.marca;
    const modelName = quote.vehicle.modelo;
    if (!year || !brandName || !modelName) {
      setVersiones([]);
      setVersion('');
      return;
    }

    // Find the selected brand option by name to get its ID
    const selectedBrandOpt = marcas.find(
      o => (o?.name ?? o?.label ?? String(valOf(o))) === brandName
    );
    if (!selectedBrandOpt) {
      setVersiones([]);
      setVersion('');
      return;
    }

    // Find the selected model option by name to get its ID
    const selectedModelOpt = modelos.find(
      o => (o?.name ?? o?.label ?? String(valOf(o))) === modelName
    );
    if (!selectedModelOpt) {
      setVersiones([]);
      setVersion('');
      return;
    }

    let mounted = true;
    (async () => {
      setLoadingVersiones(true);
      try {
        const vers = await getVersiones(selectedBrandOpt.id, year, selectedModelOpt.id);
        const arr = Array.isArray(vers) ? vers : [];
        if (!mounted) return;
        setVersiones(arr);
      } catch (error) {
        console.error('Error loading versions:', error);
        if (!mounted) return;
        setVersiones([]);
      } finally {
        if (mounted) setLoadingVersiones(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [quote.vehicle.marca, quote.vehicle.modelo, marcas, modelos, quote.vehicle.anio]);

  return (
    <StepLayout>
      <FormLayout
        stepActual={1}
        title='Empecemos a buscar el mejor precio de seguro en 3 simples pasos'
        subtitle='Por último, indicanos su versión. '
        tabs={tabs}
        onCloseTab={onCloseTab}
      >
        <SearchSelect
          ref={versionRef}
          label={`¿Qué versión es tu ${tipoVehiculo}?`}
          value={version}
          onChange={val => {
            const opt = versiones.find(o => String(valOf(o)) === String(valOf(val)));
            setVehicle({
              version: opt?.name ?? opt?.label ?? String(valOf(val)),
              codInfoAuto: opt?.id ?? valOf(val),
            });
            if (val && val !== '') {
              navigate(`/${tipoVehiculo}/provincia`);
            }
          }}
          options={versiones}
          placeholder='Seleccioná versión'
          defaultOption={{ label: 'Seleccioná versión', value: '' }}
          loading={loadingVersiones}
          disabled={!quote.vehicle.modelo || loadingVersiones}
          searchPlaceholder='Buscar versión'
        />
      </FormLayout>
    </StepLayout>
  );
}
