import { useMemo } from 'react';

import styles from './NavbarSteps.module.scss';

const STEPS_DEFAULT = [1, 2, 3];

export default function NavbarSteps({ stepActual = 1, steps = STEPS_DEFAULT }) {
  const safeStep = Math.min(Math.max(stepActual, 1), steps.length);
  const showConnectors = useMemo(() => steps.length > 1, [steps]);

  return (
    <nav className={styles.wrapper} data-comp='NavbarSteps'>
      <div
        className={styles.topRow}
        style={{ gridTemplateColumns: `repeat(${steps.length}, auto)` }}
      >
        {steps.map((_, idx) => {
          const stepIndex = idx + 1;
          const done = safeStep > stepIndex;
          const active = safeStep === stepIndex;

          return (
            <div key={stepIndex} className={styles.itemContainer}>
              <div
                className={styles.item}
                data-state={done ? 'done' : active ? 'active' : 'idle'}
                aria-current={active ? 'step' : undefined}
                aria-label={`Paso ${stepIndex}`}
                title={`Paso ${stepIndex}`}
              >
                {stepIndex}
              </div>
            </div>
          );
        })}
      </div>

      {showConnectors && (
        <div
          className={styles.connectors}
          style={{ gridTemplateColumns: `repeat(${steps.length - 1}, 1fr)` }}
        >
          {steps.slice(0, -1).map((_, i) => {
            const connected = safeStep > i + 1;
            return (
              <div
                key={i}
                className={styles.connector}
                data-connected={connected ? 'true' : 'false'}
              />
            );
          })}
        </div>
      )}
    </nav>
  );
}
