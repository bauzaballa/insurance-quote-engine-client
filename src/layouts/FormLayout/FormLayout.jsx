// src/layouts/FormLayout.jsx
import { useParams } from 'react-router-dom';

import styles from './FormLayout.module.scss';

import { HeadingApp, ParagraphApp, Tab } from '@/components/ui';
import NavbarSteps from '@/components/NavbarSteps/NavbarSteps';
import Car from '@/assets/icons/car.svg?react';
import Location from '@/assets/icons/location.svg?react';
import User from '@/assets/icons/profile.svg?react';
import Moto from '@/assets/icons/moto.svg?react';
/**
 * Layout específico para formularios/pasos que muestran steps y contenido estructurado
 * Props:
 * - stepActual?: number
 * - showSteps?: boolean (default true)
 * - title?: string
 * - subtitle?: string
 * - children: ReactNode
 * - footer?: ReactNode
 * - paddingTop?: boolean
 */
export function FormLayout({
  stepActual,
  showSteps = true,
  title,
  subtitle,
  children,
  footer,
  paddingTop = false,
  classContainer = '',
  labelVariant = 'vehiculo',
  tabs = [],
  onCloseTab,
  contentContainerWithContinue = false,
}) {
  const params = useParams();
  const iconVariant = () => {
    switch (labelVariant) {
      case 'vehiculo':
        return params.tipoVehiculo === 'moto' ? (
          <Moto width={24} height={24} />
        ) : (
          <Car width={24} height={24} />
        );
      case 'ubicacion':
        return <Location width={24} height={24} />;
      case 'personal':
        return <User width={24} height={24} />;
      default:
        return null;
    }
  };
  return (
    <div
      className={`${styles.contentContainer} ${classContainer} ${contentContainerWithContinue ? styles.contentContainerWithContinue : ''}`}
    >
      {title && (
        <HeadingApp
          variant='14px-bold'
          as='h1'
          color='blue-text'
          className={`${styles.title} ${paddingTop ? styles.paddingTop : ''}`}
        >
          {title}
        </HeadingApp>
      )}

      {showSteps && stepActual && (
        <div className={styles.stepsHeader}>
          <NavbarSteps stepActual={stepActual} />
        </div>
      )}

      {subtitle && (
        <ParagraphApp
          variant='16px-medium-uppercase'
          as='p'
          color='blue-text'
          className={styles.subtitle}
        >
          {subtitle}
        </ParagraphApp>
      )}
      {tabs && (
        <div className={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <Tab key={index} onClose={stepActual >= 6 ? undefined : () => onCloseTab(index)}>
              {tab}
            </Tab>
          ))}
        </div>
      )}
      {labelVariant && (
        <div className={styles.labelContainer}>
          <div className={styles.labelContent}>
            {iconVariant()}
            <ParagraphApp variant='15px-bold' as='p' color='blue-text'>
              {labelVariant === 'vehiculo'
                ? 'Datos del vehículo'
                : labelVariant === 'ubicacion'
                  ? 'Ubicación'
                  : 'Datos personales'}
            </ParagraphApp>
          </div>
        </div>
      )}

      {children}
      {footer}
    </div>
  );
}
