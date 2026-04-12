import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATHS } from '@utils/routes';
import { ls } from '@utils/ls';

import styles from './Paso3.module.scss';

import btnArrow from '/src/assets/icons/arrow-btn-icon.svg';

import { StepLayout } from '@/layouts';
import { useQuote } from '@/context/QuoteContext';
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

export const Paso3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quote, reset } = useQuote();

  const [rows, setRows] = useState([]);
  const [activeBrands, setActiveBrands] = useState(() => new Set());
  const [hasError, setHasError] = useState(false);

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

  const toggleBrand = companyName => {
    setActiveBrands(prev => {
      const next = new Set(prev);
      next.has(companyName) ? next.delete(companyName) : next.add(companyName);
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    if (activeBrands.size === 0) return rows;
    return rows.filter(r => activeBrands.has(r.company));
  }, [activeBrands, rows]);

  const onRecotizar = () => {
    isResettingRef.current = true;
    ls.clearQuoteStep0?.();
    ls.clearQuoteStep1?.();
    ls.clearQuoteStep2?.();
    sessionStorage.removeItem('restoreFromBack');
    reset?.();
    try {
      localStorage.removeItem('quoteDraft');
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
      return <span className={styles.notFound}>No disponible</span>;
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
      return <span className={styles.notFound}>No disponible</span>;
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

  if (hasError) {
    return (
      <StepLayout
        showSteps={false}
        showBottomLogos={true}
        showLogo={true}
        classes={layoutClasses}
        wrapperClassName={styles.errorWrapper}
        footer={false}
      >
        <div className={styles.errorContainer}>
          <img className={styles.errorIcon} src={errorIcon} alt='error icon' />
          <h4>No pudimos completar la acción.</h4>
          <p>Hubo un problema momentáneo, intentá nuevamente.</p>
          <button className={styles.retryButton} onClick={onRecotizar}>
            <span className={styles.textButton}>REINTENTAR</span>
            <img src={btnArrow} alt='' className={styles.btnIcon} />
          </button>
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
      <div className={styles.mobileHeader}>
        <div className={styles.pillsWrap}>
          {rows.map(r => {
            const on = activeBrands.has(r.company);
            return (
              <button
                key={r.company}
                type='button'
                className={`${styles.pill} ${on ? styles.pillOn : ''}`}
                onClick={() => toggleBrand(r.company)}
              >
                {r.company}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.cotizacionesContainer}>
        <PricesTable rows={filteredRows} renderCell={renderCell} classes={classesMap} />
      </div>

      <PricesCardList rows={filteredRows} renderCell={renderCell} classes={classesMap} />
    </StepLayout>
  );
};

export default Paso3;
