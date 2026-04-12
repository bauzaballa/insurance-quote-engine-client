import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Paso1.module.scss';

import { StepLayout, FormLayout } from '@/layouts';
import { Card, ParagraphApp, MerchiTooltip } from '@/components/ui';
import Car from '@/assets/icons/car.svg?react';
import Motorcycle from '@/assets/icons/moto.svg?react';

export function Paso1() {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleSelect = vehicleType => {
    setSelectedVehicle(vehicleType);
    navigate(`/${vehicleType}/anio`);
  };

  return (
    <StepLayout showButtons={false} showTabletBackButton={false}>
      <FormLayout
        showSteps={false}
        title='PARA EMPEZAR A COTIZAR TU SEGURO, SELECCIONÁ EL TIPO DE VEHÍCULO'
        paddingTop={true}
        classContainer={styles.contentContainer}
        labelVariant=''
      >
        <div className={styles.content}>
          <div className={styles.container}>
            <Card selected={selectedVehicle === 'auto'} onClick={() => handleVehicleSelect('auto')}>
              <Car />
              <ParagraphApp variant='18px-medium' as='span' color='blue-text'>
                Auto
              </ParagraphApp>
            </Card>
            <Card selected={selectedVehicle === 'moto'} onClick={() => handleVehicleSelect('moto')}>
              <Motorcycle />
              <ParagraphApp variant='18px-medium' as='span' color='blue-text'>
                Moto
              </ParagraphApp>
            </Card>
          </div>
          <div className={styles.tooltipContainer}>
            <MerchiTooltip
              type='thinking'
              text='¿Qué vamos a cotizar? <br> ¿Auto o Moto?'
              iconPosition='left'
              tooltipContainer={styles.tooltipIcon}
            />
          </div>
        </div>
      </FormLayout>
    </StepLayout>
  );
}
