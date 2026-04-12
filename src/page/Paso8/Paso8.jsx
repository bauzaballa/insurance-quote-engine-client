import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './Paso8.module.scss';

import { StepLayout, FormLayout } from '@/layouts';
import { InputGroup, MerchiTooltip } from '@/components/ui';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';
import '@/styles/shared/merchi.scss';

export function Paso8() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { quote, setUser } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();

  const [nombre, setNombre] = React.useState(quote.user.nombre || '');

  const isValid = nombre.trim() !== '';

  return (
    <StepLayout nextButtonDisabled={!isValid} onNext={() => navigate(`/${tipoVehiculo}/email`)}>
      <FormLayout
        stepActual={8}
        title='Para terminar, CONTANOS SOBRE VOS'
        subtitle='¿Cuál es tu nombre y apellido?'
        tabs={tabs}
        onCloseTab={onCloseTab}
        labelVariant='personal'
        contentContainerWithContinue={true}
      >
        <InputGroup
          id='nombre'
          name='nombre'
          label='Nombre y Apellido'
          type='text'
          placeholder='Ej: Juan Pérez'
          value={nombre}
          onChange={e => {
            const v = e.target.value;
            setNombre(v);
            setUser({ nombre: v });
          }}
        />
        <div className={`tooltipContainer ${styles.containerContent}`}>
          <MerchiTooltip
            type='celebrating'
            text='¡El mío es Merchi!'
            iconPosition='left'
            tooltipContainer={`tooltipContainerContent ${styles.tooltipIconContainer}`}
          ></MerchiTooltip>
        </div>
      </FormLayout>
    </StepLayout>
  );
}
