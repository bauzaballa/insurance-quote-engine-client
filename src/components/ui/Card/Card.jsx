import styles from './Card.module.scss';

export const Card = ({ children, onClick, selected = false, className = '', ...props }) => {
  const cardClasses = [styles.card, selected && styles['card--selected'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};
