import { useParams } from 'react-router-dom';

import { StepLayout } from '@/layouts';

export function Paso12() {
  const { tipoVehiculo } = useParams();

  return (
    <StepLayout
      stepActual={13}
      titulo='Encontramos estas coberturas para tu vehículo'
      tipoVehiculo={tipoVehiculo}
    ></StepLayout>
  );
}
