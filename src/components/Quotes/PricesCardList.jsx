// src/components/Quotes/PricesCardList.jsx

import { MerchiTooltip } from '../ui';

import styles from './PriceCardList.module.scss';

import defaultStyles from '@/layouts/StepLayout/StepLayout.module.scss';
/**
 * Mismo contrato de props que PricesTable.
 * classes debe mapear a tus clases mobile del Paso3.module.scss
 */

export default function PricesCardList({
  rows = [],
  renderCell,
  classes,
  animateTooltip = true,
  onTooltipAnimationEnd,
  onTooltipClose,
  showTooltip = true,
}) {
  if (!Array.isArray(rows)) rows = [];

  return (
    <div className={classes.mobileList}>
      {rows.map((row, i) => (
        <article key={row.key ?? row.company ?? i} className={classes.card}>
          <header className={styles.cardHeader}>
            <div className={styles.spacer} />
            {row.logo ? (
              <img src={row.logo} alt={row.company} className={classes.cardLogo} />
            ) : (
              row.company
            )}
            {showTooltip && (
              <div className={styles.tooltipContainer}>
                <MerchiTooltip
                  type='calculating'
                  text='¡Te mostramos las mejores <br> opciones de esta compañía!'
                  iconPosition='right'
                  tooltipContainer={defaultStyles.tooltipContainer}
                  arrowPosition='bottom'
                  animate={animateTooltip}
                  onAnimationEnd={onTooltipAnimationEnd}
                  onClose={onTooltipClose}
                ></MerchiTooltip>
              </div>
            )}
          </header>

          {/* “mini tabla” mobile */}
          <div className={classes.miniTable}>
            <div className={classes.sideGroup}>3ROS COMP</div>

            <div className={classes.cellLabel} data-row='rc'>
              RESP. CIVIL
            </div>
            <div className={classes.cellValue} data-row='rc'>
              {renderCell(row.cols?.rc)}
            </div>

            <div className={classes.cellLabel} data-row='total'>
              TOTAL
            </div>
            <div className={classes.cellValue} data-row='total'>
              {renderCell(row.cols?.total)}
            </div>

            <div className={classes.cellLabel} data-row='clasicos'>
              CLÁSICOS
            </div>
            <div className={classes.cellValue} data-row='clasicos'>
              {renderCell(row.cols?.clasicos)}
            </div>

            <div className={classes.cellLabel} data-row='premium'>
              PREMIUM
            </div>
            <div className={classes.cellValue} data-row='premium'>
              {renderCell(row.cols?.premium)}
            </div>

            <div className={classes.cellLabel} data-row='tr'>
              TODO RIESGO
            </div>
            <div className={classes.cellValue} data-row='tr'>
              {renderCell(row.cols?.tr)}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
