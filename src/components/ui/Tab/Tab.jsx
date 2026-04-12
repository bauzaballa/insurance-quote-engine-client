import { ParagraphApp } from '../typography';

import styles from './Tab.module.scss';

import Close from '@/assets/icons/close.svg?react';

export const Tab = ({ children, onClose }) => {
  return (
    <div className={styles.tab}>
      <ParagraphApp variant='12px-medium' as='span' color='blue-text' className={styles.text}>
        {children}
      </ParagraphApp>
      {onClose && <Close onClick={onClose} className={styles.closeIcon} />}
    </div>
  );
};
