import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './Paso9.module.scss';

import { StepLayout, FormLayout } from '@/layouts';
import { InputGroup, MerchiTooltip } from '@/components/ui';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';
import '@/styles/shared/merchi.scss';

export function Paso9() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { quote, setUser } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();

  const [email, setEmail] = React.useState(quote.user.email || '');

  const validEmail = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = email.trim() !== '' && validEmail;

  return (
    <StepLayout nextButtonDisabled={!isValid} onNext={() => navigate(`/${tipoVehiculo}/telefono`)}>
      <FormLayout
        stepActual={9}
        title='Para terminar, CONTANOS SOBRE VOS'
        subtitle='¿Cuál es tu email?'
        tabs={tabs}
        onCloseTab={onCloseTab}
        labelVariant='personal'
        contentContainerWithContinue={true}
      >
        <InputGroup
          id='email'
          name='email'
          label='Email'
          type='email'
          placeholder='ejemplo@email.com'
          value={email}
          error={!validEmail}
          errorMessage={!validEmail ? 'Ingresá un email válido' : ''}
          onChange={e => {
            const v = e.target.value;
            setEmail(v);
            setUser({ email: v });
          }}
        />
        <div className={`tooltipContainer ${styles.containerContent}`}>
          <MerchiTooltip
            type='celebrating'
            text='Falta poco. ¡Estás a un <br> paso de la cotización! '
            iconPosition='left'
            tooltipContainer={`tooltipContainerContent ${styles.tooltipIconContainer}`}
          ></MerchiTooltip>
        </div>
      </FormLayout>
    </StepLayout>
  );
}
