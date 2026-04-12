import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { StepLayout, FormLayout } from '@/layouts';
import { InputGroup } from '@/components/ui';
import { useQuoteStore } from '@/stores/quoteStore';
import { useQuoteTabs } from '@/hooks/useQuoteTabs';
import { startSanCristobalQuote } from '@/services/quotation';

export function Paso11() {
  const navigate = useNavigate();
  const { tipoVehiculo } = useParams();
  const { quote, setUser } = useQuoteStore();
  const { tabs, onCloseTab } = useQuoteTabs();

  const [edad, setEdad] = React.useState(quote.user.edad || '');

  const validEdad = !edad || (Number(edad) > 0 && Number(edad) >= 18 && Number(edad) <= 100);
  const isValid = edad.toString().trim() !== '' && validEdad;

  let errorMessage = '';
  if (edad && Number(edad) > 0 && Number(edad) < 18) {
    errorMessage = 'Debes ser mayor de edad';
  } else if (edad && Number(edad) > 100) {
    errorMessage = 'La edad no puede ser mayor a 100 años';
  } else if (edad && Number(edad) <= 0) {
    errorMessage = 'Ingresá una edad válida';
  }

  const handleNext = async () => {
    setUser({ edad });

    try {
      if (quote?.quoteId) {
        await startSanCristobalQuote(
          {
            vehicle: quote.vehicle,
            location: quote.location,
            user: { ...quote.user, edad },
          },
          quote.quoteId
        );
      }
    } catch (error) {
      console.warn('Error starting San Cristobal quote:', error.message);
    }

    navigate(`/${tipoVehiculo}/finalizar`);
  };

  return (
    <StepLayout nextButtonDisabled={!isValid} onNext={handleNext}>
      <FormLayout
        stepActual={11}
        title='Para terminar, CONTANOS SOBRE VOS'
        subtitle='¿Cuál es tu edad?'
        tabs={tabs}
        onCloseTab={onCloseTab}
        labelVariant='personal'
        contentContainerWithContinue={true}
      >
        <InputGroup
          id='edad'
          name='edad'
          label='Edad'
          type='number'
          placeholder='Ej: 30'
          value={edad}
          min='18'
          max='100'
          error={!validEdad}
          errorMessage={errorMessage}
          onChange={e => {
            const v = e.target.value;
            setEdad(v);
            setUser({ edad: v });
          }}
        />
      </FormLayout>
    </StepLayout>
  );
}
