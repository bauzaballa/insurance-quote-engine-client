// src/layouts/StepLayout.jsx
import { useNavigate, useLocation } from 'react-router-dom';

import defaultStyles from './StepLayout.module.scss';

import ResponsiveLogos from '@/components/ResponsiveLogos/ResponsiveLogos';
import { Button, Marquee, MerchiTooltip, ParagraphApp } from '@/components/ui';
import logoMerci from '@/assets/images/logoMerci.svg';
import InfoIcon from '@/assets/icons/info.svg?react';
import { useQuoteStore } from '@/stores/quoteStore';
import RecotizarIcon from '@/assets/icons/recotizar.svg?react';
// Estilos por defecto
/**
 * Props:
 * - stepActual?: number -> paso actual (si no se pasa, se calcula automáticamente desde la ruta)
 * - showBottomLogos?: boolean (default true) -> mostrar/ocultar logos inferiores
 * - showMarquee?: boolean (default true) -> mostrar/ocultar marquee de brands
 * - showLogo?: boolean (default true) -> mostrar/ocultar logo del header
 * - classes?: { container, header, logo, logosContainer, marqueeContainer } -> override de clases CSS
 * - wrapperClassName?: string -> clases extra para el wrapper raíz
 * - children: ReactNode -> contenido principal (puede ser FormLayout u otro)
 * - showStepContainer?: boolean (default true)
 * - showMarqueeMobile?: boolean (default false)
 * - showAlert?: boolean (default true)
 * - showButtons?: boolean (default true) -> mostrar/ocultar botones de navegación
 * - nextButtonDisabled?: boolean (default true) -> estado del botón siguiente
 * - onNext?: function -> función a ejecutar cuando se hace click en siguiente
 * - showRecotizarButton?: boolean (default false) -> mostrar/ocultar botón de recotizar
 * - onRecotizar?: function -> función a ejecutar cuando se hace click en recotizar
 */

export function StepLayout({
  isInStep2 = false,
  showBottomLogos = true,
  showLogo = true,
  classes = {},
  wrapperClassName = '',
  children,
  showStepContainer = true,
  showMarqueeMobile = false,
  showAlert = true,
  showButtons = true,
  nextButtonDisabled = true,
  onNext,
  showTooltip = false,
  showRecotizarButton = false,
  onRecotizar,
  stepActual,
  showTabletBackButton = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setVehicle, resetLocation, resetUser, resetQuote } = useQuoteStore();

  // Función para determinar el paso actual basado en la ruta
  const getCurrentStep = pathname => {
    // Para rutas con parámetros dinámicos, necesitamos verificar patrones
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathname === '/') return 0;
    if (pathname === '/tipo-vehiculo') return 1;

    // Para rutas con :tipoVehiculo, verificar el último segmento
    if (pathSegments.length >= 2) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const routeMap = {
        anio: 2,
        marca: 3,
        modelo: 4,
        version: 5,
        provincia: 6,
        localidad: 7,
        'datos-personales': 8,
        email: 9,
        telefono: 10,
        edad: 11,
        resultados: 12,
        finalizar: 13,
      };
      return routeMap[lastSegment] || -1;
    }

    return -1;
  };

  const currentStep = stepActual ?? getCurrentStep(location.pathname);

  // Función para manejar volver atrás con reseteo de datos
  const handleGoBack = () => {
    // Si no podemos determinar el paso actual, usar navegación del navegador
    if (currentStep === -1) {
      navigate(-1);
      return;
    }

    // Si estamos en el paso 0, no hay paso anterior
    if (currentStep === 0) {
      return;
    }

    const previousStep = currentStep - 1;

    // Definir el orden de los pasos para saber qué resetear
    const stepOrder = [
      'tipo-vehiculo',
      'anio',
      'marca',
      'modelo',
      'version',
      'provincia',
      'localidad',
      'datos-personales',
      'email',
      'telefono',
      'edad',
    ];

    // Función para construir la ruta del paso anterior
    const buildPreviousRoute = (currentStep, pathname) => {
      // TODO: Cambiar para que vuelva al paso 1 cuando se esté en el paso 2
      if (currentStep <= 2) {
        return '/';
      }

      // Para pasos > 1, necesitamos mantener el tipoVehiculo
      const pathSegments = pathname.split('/').filter(Boolean);
      const tipoVehiculo = pathSegments[0]; // El primer segmento es el tipoVehiculo

      const stepRoutes = {
        1: '/tipo-vehiculo',
        2: `/${tipoVehiculo}/anio`,
        3: `/${tipoVehiculo}/marca`,
        4: `/${tipoVehiculo}/modelo`,
        5: `/${tipoVehiculo}/version`,
        6: `/${tipoVehiculo}/provincia`,
        7: `/${tipoVehiculo}/localidad`,
        8: `/${tipoVehiculo}/datos-personales`,
        9: `/${tipoVehiculo}/email`,
        10: `/${tipoVehiculo}/telefono`,
        11: `/${tipoVehiculo}/edad`,
        12: `/${tipoVehiculo}/resultados`,
        13: `/${tipoVehiculo}/finalizar`,
      };

      return stepRoutes[previousStep] || '/';
    };

    // Resetear datos desde el paso actual hacia adelante
    const resetDataFromStep = stepIndex => {
      // Resetear desde el paso actual hacia adelante
      for (let i = stepIndex; i < stepOrder.length; i++) {
        const step = stepOrder[i];
        switch (step) {
          case 'marca':
            setVehicle({ marca: '' });
            break;
          case 'modelo':
            setVehicle({ modelo: '' });
            break;
          case 'version':
            setVehicle({ version: '', codInfoAuto: '' });
            break;
          case 'provincia':
            resetLocation();
            break;
          case 'localidad':
            // La localidad ya se resetea con resetLocation
            break;
          case 'datos-personales':
          case 'email':
          case 'telefono':
          case 'edad':
            resetUser();
            break;
          default:
            break;
        }
      }
    };

    // Determinar el índice del paso actual para el reseteo
    const currentPathSegment = location.pathname.split('/').pop();
    const currentStepIndex = stepOrder.indexOf(currentPathSegment);

    // Resetear datos desde el paso actual hacia adelante
    if (currentStepIndex >= 0) {
      resetDataFromStep(currentStepIndex);
    }

    // Navegar al paso anterior
    const previousRoute = buildPreviousRoute(currentStep, location.pathname);
    navigate(previousRoute);
  };

  // Función para manejar recotizar (reiniciar cotización completa)
  const handleRecotizar = () => {
    if (onRecotizar) {
      onRecotizar();
    } else {
      // Reset completo de la cotización
      resetQuote();
      navigate('/');
    }
  };

  return (
    <main
      className={`wf-home ${wrapperClassName || ''} background-merci ${showStepContainer ? 'step-gap' : ''}`}
    >
      {/* <img className="BackgroundLogo" src={backgroundMerci} alt="" /> */}

      {showLogo && (
        <header className={classes.logoContainer || defaultStyles.logoContainer}>
          <a href='/'>
            <img src={logoMerci} alt='Merci' className={classes.logo || defaultStyles.logo} />
          </a>
          {showTooltip && (
            <div className={defaultStyles.showDesktopTooltip}>
              <MerchiTooltip
                type='greeting'
                text='¡Te mostramos las mejores<br> opciones de esta compañía!'
                iconPosition='right'
                tooltipContainer={defaultStyles.tooltipHeaderContainer}
                arrowPosition='bottom'
                closeIconPosition='left'
              ></MerchiTooltip>
            </div>
          )}
          {/* Elemento invisible para balancear el flexbox */}
          <div className={defaultStyles.logoSpacer}></div>
        </header>
      )}
      <section
        className={
          classes.container ||
          (showStepContainer ? defaultStyles.StepContainer : defaultStyles.defaultContainer)
        }
      >
        <div className={defaultStyles.childrenContainer}>{children}</div>
        <div
          className={`${defaultStyles.buttonsContainer} ${showButtons ? defaultStyles.showButtons : ''}`}
        >
          {showButtons && onNext && (
            <Button
              disabled={nextButtonDisabled}
              onClick={onNext}
              className={defaultStyles.mobileContinueButton}
            >
              {currentStep === 11 ? 'VER MI COTIZACIÓN' : 'SIGUIENTE'}
            </Button>
          )}
          {showButtons && (
            <Button variant='outline' onClick={handleGoBack} className={defaultStyles.button}>
              {'VOLVER'}
            </Button>
          )}
          {showTabletBackButton && (
            <Button variant='outline' onClick={handleGoBack} className={defaultStyles.backButton}>
              {'VOLVER'}
            </Button>
          )}
          {showAlert && (
            <div className={defaultStyles.alertContainer}>
              <InfoIcon className={defaultStyles.alertIcon} />
              <ParagraphApp
                variant='12px-medium'
                as='p'
                color='dark-blue'
                className={defaultStyles.alert}
              >
                {isInStep2
                  ? 'Usaremos tu ubicación solo para calcular la cotización.'
                  : currentStep > 7
                    ? 'No compartimos tu información, usamos estos datos para darte una cotización precisa.'
                    : 'No compartimos tu información. Al completar con tus datos no generás un compromiso de contratación.'}
              </ParagraphApp>
            </div>
          )}
          {showButtons &&
            (currentStep === 11 ? (
              <div className={defaultStyles.buttonContainer}>
                <MerchiTooltip
                  type='calculating'
                  text='¡Mirá las cotizaciones <br> disponibles para vos!'
                  iconPosition='right'
                  tooltipContainer={defaultStyles.tooltipContainer}
                  arrowPosition='bottom'
                ></MerchiTooltip>
                <Button
                  disabled={nextButtonDisabled}
                  onClick={onNext}
                  className={defaultStyles.button}
                >
                  VER MI COTIZACIÓN
                </Button>
              </div>
            ) : (
              <Button
                disabled={nextButtonDisabled}
                onClick={onNext}
                className={defaultStyles.button}
              >
                SIGUIENTE
              </Button>
            ))}
          {showRecotizarButton && (
            <Button onClick={handleRecotizar} className={defaultStyles.recotizarButton}>
              <RecotizarIcon /> RECOTIZAR
            </Button>
          )}
        </div>
      </section>
      {showBottomLogos && (
        <ResponsiveLogos
          className={`${classes.logosContainer || defaultStyles.logosContainer} ${showMarqueeMobile ? defaultStyles.withMarginTop : ''}`}
          showTablet={showStepContainer}
        />
      )}
      {showMarqueeMobile && (
        <Marquee className={classes.marqueeContainer || defaultStyles.marqueeContainer} />
      )}
    </main>
  );
}
