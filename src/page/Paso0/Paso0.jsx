import { useNavigate } from 'react-router-dom';

import styles from './Paso0.module.scss';

// import logoDesktop from '/src/assets/images/logo-merci.svg';
import stepLayoutStyles from '@/layouts/StepLayout/StepLayout.module.scss';
import { Button, HeadingApp, ParagraphApp } from '@/components/ui';
import { StepLayout } from '@/layouts';
import Marquees from '@/components/ui/Marquees/Marquees';
import CalculatorIcon from '@/assets/icons/calculator.svg?react';
import conjuntoIconosTablet from '/src/assets/images/conjunto-iconos-seguros-tablet.svg';

export function Paso0() {
  const navigate = useNavigate();

  return (
    <StepLayout
      stepActual={1}
      showStepContainer={false}
      showSteps={false}
      showMarqueeMobile={true}
      showAlert={false}
      showButtons={false}
      showTabletBackButton={false}
      classes={{
        logosContainer: `${stepLayoutStyles.logosContainer} ${stepLayoutStyles.logosContainerShowTablet} ${styles.hideDesktop}`,
      }}
    >
      <div className={styles.startContainer}>
        <div className={styles.startContainerContent}>
          <div className={styles.startContainerContentText}>
            <HeadingApp variant='18px-bold' as='h1' color='blue-text' className={styles.start}>
              <span className={styles.startTitle1}>Tu vehículo, </span>
              <br />
              <span className={styles.startTitle2}>bien asegurado</span>
            </HeadingApp>
            <ParagraphApp
              variant='16px-medium-uppercase'
              as='span'
              color='blue-text'
              className={styles.start + ' ' + styles.startTitle}
            >
              compará y elegi la mejor cobertura
            </ParagraphApp>
            <Button onClick={() => navigate('/auto/anio')} className={styles.buttonDesktop}>
              <CalculatorIcon />
              COTIZAR AHORA
            </Button>
          </div>
          <img src={conjuntoIconosTablet} alt='logo' className={styles.logoDesktop} />
        </div>
      </div>
      <Marquees />
      <Button onClick={() => navigate('/auto/anio')} className={styles.buttonMobile}>
        <CalculatorIcon />
        COTIZAR AHORA
      </Button>
    </StepLayout>
  );
}
