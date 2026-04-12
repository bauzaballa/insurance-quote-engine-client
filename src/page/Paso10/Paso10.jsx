import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './Paso10.module.scss';

import { StepLayout, FormLayout } from '@/layouts';
import { InputGroup, MerchiTooltip } from '@/components/ui';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';

import '@/styles/shared/merchi.scss';

export function Paso10() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { quote, setUser } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();

  const [telefono, setTelefono] = React.useState(quote.user.telefono || '');

  const validTelefono = !telefono || /^\d{6,15}$/.test(telefono.replace(/\D/g, ''));
  const isValid = telefono.trim() !== '' && validTelefono;

  return (
    <StepLayout nextButtonDisabled={!isValid} onNext={() => navigate(`/${tipoVehiculo}/edad`)}>
      <FormLayout
        stepActual={10}
        title='Para terminar, CONTANOS SOBRE VOS'
        subtitle='¿Cuál es tu teléfono celular?'
        tabs={tabs}
        onCloseTab={onCloseTab}
        labelVariant='personal'
        contentContainerWithContinue={true}
      >
        <InputGroup
          id='telefono'
          name='telefono'
          label='Teléfono (Celular)'
          type='tel'
          placeholder='2211234567'
          value={telefono}
          error={!validTelefono}
          errorMessage={!validTelefono ? 'Solo números (6–15 dígitos)' : ''}
          onChange={e => {
            const v = e.target.value;
            setTelefono(v);
            setUser({ telefono: v });
          }}
        />
        <div className={styles.tooltipContainer}>
          <MerchiTooltip
            type='greeting'
            text='No te preocupes, tus datos están protegidos con nosotros, no los compartimos.'
            iconPosition='right'
            tooltipContainer='tooltipContainerContent'
          ></MerchiTooltip>
        </div>
      </FormLayout>
    </StepLayout>
  );
}
