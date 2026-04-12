import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './Paso2.module.scss';

import '@/styles/shared/merchi.scss';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { StepLayout, FormLayout } from '@/layouts';
import { getAnios } from '@/services/vehicle';
import { MerchiTooltip } from '@/components/ui';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';

export function Paso2() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { setVehicle } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();
  const [anio] = React.useState('');
  const [anios, setAnios] = React.useState([]);

  const anioRef = React.useRef(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const a = await getAnios();
        if (!mounted) return;
        setAnios(a);
      } catch (error) {
        console.error('Error loading years:', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StepLayout>
      <FormLayout
        stepActual={1}
        title='Empecemos a buscar el mejor precio de seguro en 3 simples pasos'
        subtitle='Primero, contanos un poco sobre tu vehículo.'
        tabs={tabs}
        onCloseTab={onCloseTab}
      >
        <div className={styles.selectContainer}>
          <SearchSelect
            ref={anioRef}
            label={`¿De qué año es tu ${tipoVehiculo}?`}
            value={anio}
            onChange={val => {
              setVehicle({ anio: val });
              if (val && val !== '') {
                navigate(`/${tipoVehiculo}/marca`);
              }
            }}
            options={anios}
            placeholder='Seleccioná un año'
            defaultOption={{ label: 'Seleccioná un año', value: '' }}
            searchPlaceholder='Buscar año'
          />
        </div>
        <div className='tooltipContainer'>
          <MerchiTooltip
            type='greeting'
            text='¿No estas seguro?  Podés revisar en tu cédula verde.'
            iconPosition='right'
            tooltipContainer='tooltipContainerContent'
          ></MerchiTooltip>
        </div>
      </FormLayout>
    </StepLayout>
  );
}
