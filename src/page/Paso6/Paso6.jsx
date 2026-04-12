import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './Paso6.module.scss';

import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { StepLayout, FormLayout } from '@/layouts';
import { getProvinciasFromPostalCodes } from '@/services/postalCodes';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';
import { MerchiTooltip } from '@/components/ui';

import '@/styles/shared/merchi.scss';

const valOf = x => (x && typeof x === 'object' ? x.value : (x ?? ''));

const findOptionByValue = (list, v) =>
  (list || []).find(o => String(o?.value ?? o?.id ?? o) === String(valOf(v))) || null;

export function Paso6() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { setLocation } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();

  const [provincias, setProvincias] = useState([]);
  const [provincia] = useState('');
  const [loadingProvincias, setLoadingProvincias] = useState(false);

  const provRef = useRef(null);

  // Load provinces
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

  return (
    <StepLayout isInStep2={true}>
      <FormLayout
        stepActual={2}
        title='Para terminar, necesitamos saber dónde vivís'
        subtitle='Ahora elegí la provincia donde vivís.'
        tabs={tabs}
        onCloseTab={onCloseTab}
        labelVariant='ubicacion'
      >
        <SearchSelect
          ref={provRef}
          label='¿En qué provincia vivís?'
          value={provincia}
          onChange={val => {
            const opt = findOptionByValue(provincias, val);
            setLocation({
              provincia: opt?.name ?? opt?.label ?? String(valOf(val)),
            });
            if (val && val !== '') {
              navigate(`/${tipoVehiculo}/localidad`);
            }
          }}
          options={provincias}
          placeholder='Seleccioná provincia'
          defaultOption={{ label: 'Seleccioná provincia', value: '' }}
          loading={loadingProvincias}
          searchPlaceholder='Buscar provincia'
        />
        <div className='tooltipContainer'>
          <MerchiTooltip
            type='mapping'
            text='Cada zona tiene precios y coberturas diferentes.'
            iconPosition='right'
            tooltipContainer={`tooltipContainerContent ${styles.tooltipIconContainer}`}
          ></MerchiTooltip>
        </div>
      </FormLayout>
    </StepLayout>
  );
}
