import { useState } from 'react';

import { ParagraphApp } from '../typography';

import styles from './MerchiTooltip.module.scss';

import Greeting from '@/assets/merchi/greeting.svg?react';
import Celebrating from '@/assets/merchi/celebrating.svg?react';
import Calculating from '@/assets/merchi/calculating.svg?react';
import Mapping from '@/assets/merchi/mapping.svg?react';
import Thinking from '@/assets/merchi/thinking.svg?react';
import Close from '@/assets/icons/close.svg?react';

export const MerchiTooltip = ({
  type = 'greeting',
  text,
  iconPosition = 'left',
  tooltipContainer = '',
  arrowPosition = 'top', // 'top' | 'bottom'
  closeIconPosition, // 'left' | 'right' | undefined (auto based on arrowPosition)
  animate = true,
  onAnimationEnd,
  onClose,
}) => {
  const [status, setStatus] = useState('open'); // 'open' | 'closing' | 'closed'

  const getIcon = type => {
    switch (type) {
      case 'greeting':
        return <Greeting />;
      case 'celebrating':
        return <Celebrating />;
      case 'calculating':
        return <Calculating />;
      case 'mapping':
        return <Mapping />;
      case 'thinking':
        return <Thinking />;
      default:
        return null;
    }
  };

  const handleClose = () => {
    setStatus('closing');
  };

  const handleAnimationEnd = () => {
    if (status === 'closing') {
      setStatus('closed');
      onClose?.();
    } else if (animate) {
      onAnimationEnd?.();
    }
  };

  const tooltipClass = [
    styles.tooltip,
    status === 'closing' ? styles.closing : '',
    status === 'closed' ? styles.closed : '',
    !animate ? styles.noAnimation : '',
  ]
    .filter(Boolean)
    .join(' ');

  const arrowClass = [
    styles.tooltipArrow,
    arrowPosition === 'bottom' ? styles.arrowBottom : styles.arrowTop,
  ]
    .filter(Boolean)
    .join(' ');

  const closeClass = [
    styles.closeIcon,
    closeIconPosition === 'left'
      ? styles.closeLeft
      : closeIconPosition === 'right'
        ? styles.closeRight
        : arrowPosition === 'bottom'
          ? styles.closeLeft
          : styles.closeRight,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={tooltipClass} onAnimationEnd={handleAnimationEnd}>
      <div className={arrowClass}></div>
      <div
        className={`${styles.tooltipContent} ${styles[iconPosition]} ${iconPosition === 'left' ? styles['padding-left'] : styles['padding-right']}`}
      >
        <div className={`${styles.tooltipIcon} ${tooltipContainer}`}>{getIcon(type)}</div>
        <ParagraphApp
          variant='10px-bold'
          as='p'
          color='blue-text'
          className={styles.tooltipText}
          dangerouslySetInnerHTML={{ __html: text }}
        />
        <Close className={closeClass} onClick={handleClose} />
      </div>
    </div>
  );
};
