import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATHS } from '@utils/routes';
import { ls } from '@utils/ls';

import styles from './Paso13.module.scss';

import typographyStyles from '@/components/ui/typography/typography.module.scss';
import SearchIcon from '/src/assets/icons/search.svg';
import btnArrow from '/src/assets/icons/arrow-btn-icon.svg';
import ArrowLeft from '/src/assets/icons/arrow-left.svg?react';
import ArrowRight from '/src/assets/icons/arrow-right.svg?react';
import { StepLayout } from '@/layouts';
import { useQuoteStore } from '@/stores/quoteStore';
import {
  createProgressiveQuotePoller,
  processProgressiveResults,
  sendQuotationEmail,
} from '@/services/quotation';
import PricesTable from '@/components/Quotes/PricesTable';
import PricesCardList from '@/components/Quotes/PricesCardList';
import logoProvincia from '/src/assets/brands/provincia-seguros.svg';
import logoMercantil from '/src/assets/brands/mercantil-seguros.svg';
import logoAtm from '/src/assets/brands/atm-seguros.svg';
import logoFedpat from '/src/assets/brands/fedpat-seguros.svg';
import logoFedpatMobile from '/src/assets/brands/fedpat-seguros-mobile.svg';
import logoSanCristobal from '/src/assets/brands/san-cristobal.svg';
import errorIcon from '/src/assets/icons/error-icon.svg';
import { Button, HeadingApp, ParagraphApp } from '@/components/ui';

const logoFedpatFinal =
  typeof window !== 'undefined' && window.innerWidth < 768 ? logoFedpatMobile : logoFedpat;

const classesMap = {
  tableWrapper: styles.tableWrapper,
  table: styles.table,
  companyCell: styles.companyCell,
  brandLogo: styles.brandLogo,
  mobileList: styles.mobileList,
  card: styles.card,
  cardHeader: styles.cardHeader,
  cardLogo: styles.cardLogo,
  miniTable: styles.miniTable,
  sideGroup: styles.sideGroup,
  cellLabel: styles.cellLabel,
  cellValue: styles.cellValue,
};

const LOGOS = {
  Provincia: logoProvincia,
  'Mercantil Andina': logoMercantil,
  ATM: logoAtm,
  'Federacion Patronal': logoFedpatFinal,
  'San Cristóbal': logoSanCristobal,
};

const ALL_BRANDS = ['Provincia', 'Mercantil Andina', 'ATM', 'Federacion Patronal', 'San Cristóbal'];

const normalizeName = s =>
  String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/seguro(s)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const pickLogo = company => {
  const key = normalizeName(company);
  if (key === 'provincia') return LOGOS['Provincia'];
  if (key === 'mercantil andina') return LOGOS['Mercantil Andina'];
  if (key === 'atm') return LOGOS['ATM'];
  if (key === 'federacion patronal') return LOGOS['Federacion Patronal'];
  if (key === 'san cristobal') return LOGOS['San Cristóbal'];
  return null;
};

export const Paso13 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quote, reset } = useQuoteStore();

  const [rows, setRows] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [hasShownTooltipAnimation, setHasShownTooltipAnimation] = useState(false);
  const [tooltipClosedByUser, setTooltipClosedByUser] = useState(false);

  const simulateErrorFlag = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get('simulateError') === '1';
  }, [location.search]);

  const isQuoteComplete = q => {
    const v = q?.vehicle || {};
    const l = q?.location || {};
    const u = q?.user || {};
    return (
      v.marca &&
      v.modelo &&
      v.version &&
      v.anio &&
      l.provincia &&
      (l.municipio || l.localidad) &&
      u.nombre &&
      u.email &&
      u.telefono &&
      u.edad
    );
  };

  const isResettingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isResettingRef.current) return;
    if (!isQuoteComplete(quote)) return;

    if (simulateErrorFlag) {
      setRows([]);
      setHasError(true);
      return;
    }

    setHasError(false);

    try {
      const quoteId = quote?.quoteId;

      if (!quoteId) {
        setHasError(true);
        return;
      }

      const initialRows = ALL_BRANDS.map(name => ({
        company: name,
        logo: pickLogo(name),
        cols: {
          rc: 'loading',
          total: 'loading',
          clasicos: 'loading',
          premium: 'loading',
          tr: 'loading',
        },
        isComplete: false,
      }));
      setRows(initialRows);

      let emailSent = false;
      const cancelPoller = createProgressiveQuotePoller(
        quoteId,
        statusData => {
          const completedResults = processProgressiveResults(statusData, LOGOS);
          const errorsByProvider = {};
          (statusData?.errors || []).forEach(err => {
            errorsByProvider[normalizeName(err.provider)] = err;
          });

          setRows(prevRows => {
            const updatedRows = [...prevRows];
            const completedCompanies = new Set();

            completedResults.forEach(result => {
              const index = updatedRows.findIndex(
                row => normalizeName(row.company) === normalizeName(result.company)
              );

              if (index >= 0) {
                updatedRows[index] = {
                  ...result,
                  logo: updatedRows[index].logo || result.logo,
                  isComplete: true,
                };
                completedCompanies.add(normalizeName(result.company));
              } else {
                updatedRows.push({ ...result, isComplete: true });
                completedCompanies.add(normalizeName(result.company));
              }
            });

            // Solo marcar como "not_found" si hay error explícito o si done:true
            if (statusData?.done) {
              updatedRows.forEach(row => {
                const normalizedCompany = normalizeName(row.company);
                if (!completedCompanies.has(normalizedCompany) && !row.isComplete) {
                  // Si hay error para este provider, mostrar "not_found"
                  if (errorsByProvider[normalizedCompany]) {
                    row.cols = {
                      rc: 'not_found',
                      total: 'not_found',
                      clasicos: 'not_found',
                      premium: 'not_found',
                      tr: 'not_found',
                    };
                  }
                  row.isComplete = true;
                }
              });

              if (!emailSent) {
                emailSent = true;
                sendQuotationEmail(quoteId, quote.user)
                  .then(() => {})
                  .catch(() => {});
              }
            }

            return updatedRows;
          });
        },
        { intervalMs: 800, maxTimeMs: 30000 }
      );

      return cancelPoller;
    } catch {
      setHasError(true);
    }
  }, [quote, simulateErrorFlag]);

  useEffect(() => {
    const cleanup = fetchData();
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [fetchData]);

  const selectedRow = useMemo(() => {
    if (!selectedCompany) return null;
    return rows.find(r => r.company === selectedCompany) || null;
  }, [selectedCompany, rows]);

  const selectedCompanyIndex = useMemo(() => {
    if (!selectedCompany) return -1;
    return rows.findIndex(r => r.company === selectedCompany);
  }, [selectedCompany, rows]);

  const goToNextCompany = () => {
    const currentIndex = selectedCompanyIndex;
    const nextIndex = (currentIndex + 1) % rows.length;
    setSelectedCompany(rows[nextIndex].company);
  };

  const goToPreviousCompany = () => {
    const currentIndex = selectedCompanyIndex;
    const prevIndex = currentIndex <= 0 ? rows.length - 1 : currentIndex - 1;
    setSelectedCompany(rows[prevIndex].company);
  };

  const onRecotizar = () => {
    isResettingRef.current = true;
    ls.clearQuoteStep0?.();
    ls.clearQuoteStep1?.();
    ls.clearQuoteStep2?.();
    sessionStorage.removeItem('restoreFromBack');
    reset?.();
    try {
      localStorage.removeItem('quote-storage');
    } catch {
      // ignore
    }
    navigate(PATHS.paso0, { replace: true });
  };

  const renderCell = value => {
    if (value === 'loading') {
      return (
        <div className={styles.loadingCell} aria-label='Cargando'>
          <div className={styles.skeleton}></div>
        </div>
      );
    }
    if (value === 'not_found') {
      return <span className={styles.notFound}>No encontrado</span>;
    }

    const raw =
      value && typeof value === 'object' && 'planValue' in value ? value.planValue : value;

    let n;
    if (typeof raw === 'number') {
      n = Number.isFinite(raw) ? raw : null;
    } else if (typeof raw === 'string') {
      const parsed = Number(raw.replace(/\./g, '').replace(',', '.'));
      n = Number.isFinite(parsed) ? parsed : null;
    } else {
      n = null;
    }

    if (n == null) {
      return <span className={styles.notFound}>No encontrado</span>;
    }

    const formatted = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(n);

    return <span className={styles.priceBtn}>{formatted}</span>;
  };

  const layoutClasses = {
    container: styles.StepContainer,
    header: styles.stepsHeader,
    logo: styles.logo,
    logosContainer: styles.logosContainer,
  };

  const hasNoResults =
    rows.length === 0 ||
    rows.every(
      row => row.isComplete && Object.values(row.cols || {}).every(col => col === 'not_found')
    );

  if (hasError && !hasNoResults) {
    return (
      <StepLayout
        showSteps={false}
        showBottomLogos={true}
        showLogo={true}
        classes={layoutClasses}
        wrapperClassName={styles.errorWrapper}
        footer={false}
        showButtons={false}
        showAlert={false}
        showTabletBackButton={false}
      >
        <div className={styles.errorContainer}>
          <img className={styles.errorIcon} src={errorIcon} alt='error icon' />
          <h4>No pudimos completar la acción.</h4>
          <p style={{ color: '#484848' }}>
            <span className={typographyStyles['typography-14px-bold-centered']}>
              No encontramos resultados acordes a tu búsqueda.
            </span>
            <span className={typographyStyles['typography-14px-medium-centered']}>
              {' '}
              Volvé a intentar
            </span>
          </p>
          <Button className={styles.retryButton} onClick={onRecotizar}>
            REINTENTAR
          </Button>
        </div>
      </StepLayout>
    );
  }

  if (rows.length === 0) {
    return (
      <StepLayout
        showSteps={false}
        showBottomLogos={false}
        showLogo={true}
        classes={layoutClasses}
        showButtons={false}
        showAlert={false}
        showTabletBackButton={false}
      >
        <div className={styles.errorContainer}>
          <img className={styles.errorIcon} src={SearchIcon} alt='error icon' />
          <p style={{ color: '#484848', maxWidth: '300px' }}>
            <span className={typographyStyles['typography-14px-bold-centered']}>
              No encontramos resultados acordes a tu búsqueda.
            </span>
            <span className={typographyStyles['typography-14px-medium-centered']}>
              {' '}
              Volvé a intentar
            </span>
          </p>
          <Button className={styles.retryButton} onClick={onRecotizar}>
            REINTENTAR
          </Button>
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout
      showSteps={false}
      showBottomLogos={false}
      showLogo={true}
      classes={layoutClasses}
      wrapperClassName='mobile-grid-step'
      showTooltip={true}
      showRecotizarButton={true}
      onRecotizar={onRecotizar}
      showButtons={false}
      showAlert={false}
      showTabletBackButton={false}
      footer={
        <div className={styles.footerContainer}>
          <button className={styles.BtnContinuar} onClick={onRecotizar}>
            <span className={styles.textButton}>
              RECOTIZAR
              <img src={btnArrow} alt='' className={styles.btnIcon} />
            </span>
          </button>
        </div>
      }
    >
      <header className={styles.header}>
        <HeadingApp
          variant='14px-bold'
          as='h1'
          color='blue-text'
          className={`${styles.title} ${selectedCompany ? styles.selectedCompany : ''}`}
        >
          Encontramos estas coberturas para tu vehículo.
        </HeadingApp>
        {!selectedCompany && (
          <ParagraphApp variant='12px-medium' as='p' color='blue-text' className={styles.subtitle}>
            Selecciona la aseguradora de tu preferencia para ver más detalles.
          </ParagraphApp>
        )}
      </header>
      {!selectedCompany && (
        <div className={styles.mobileCompanyList}>
          {rows.map(r => (
            <button
              key={r.company}
              type='button'
              className={`${styles.companyItem} ${selectedCompany === r.company ? styles.companyItemActive : ''}`}
              onClick={() => setSelectedCompany(prev => (prev === r.company ? null : r.company))}
            >
              {r.logo ? (
                <img src={r.logo} alt={r.company} className={styles.companyItemLogo} />
              ) : (
                r.company
              )}
            </button>
          ))}
        </div>
      )}
      <div className={styles.cotizacionesContainer}>
        <PricesTable rows={rows} renderCell={renderCell} classes={classesMap} />
      </div>
      {selectedRow && (
        <>
          <PricesCardList
            rows={[selectedRow]}
            renderCell={renderCell}
            classes={classesMap}
            showTooltip={!tooltipClosedByUser}
            animateTooltip={!hasShownTooltipAnimation && !tooltipClosedByUser}
            onTooltipAnimationEnd={() => setHasShownTooltipAnimation(true)}
            onTooltipClose={() => setTooltipClosedByUser(true)}
          />
          <div className={styles.mobileNavigation}>
            <button
              type='button'
              className={styles.navButton}
              onClick={goToNextCompany}
              disabled={rows.length <= 1}
            >
              <ArrowRight />
              <span className={styles.navButtonText}>Siguiente cotización</span>
            </button>
            <button
              type='button'
              className={styles.navButton}
              onClick={goToPreviousCompany}
              disabled={rows.length <= 1}
            >
              <ArrowLeft />
              <span className={styles.navButtonText}>Cotización anterior</span>
            </button>
          </div>
        </>
      )}
    </StepLayout>
  );
};

export default Paso13;
