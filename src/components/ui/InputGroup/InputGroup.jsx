import styles from './InputGroup.module.scss';

const InputGroup = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  error = false,
  errorMessage = '',
  className = '',
  inputClassName = '',
  id,
  name,
  min,
  max,
  ...props
}) => {
  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        id={id}
        name={name}
        min={min}
        max={max}
        className={`${styles.input} ${error ? styles.error : ''} ${inputClassName}`}
        {...props}
      />
      {error && errorMessage && <span className={styles.errorMsg}>{errorMessage}</span>}
    </div>
  );
};

export default InputGroup;
