import styles from './Button.module.scss';

const Button = ({
  children,
  variant = 'default',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClasses = `${className} ${styles.button} ${styles[`button--${variant}`]}`.trim();

  return (
    <button type={type} className={buttonClasses} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
