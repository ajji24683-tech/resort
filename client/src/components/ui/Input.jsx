import './Input.css';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`input-field input-textarea ${icon ? 'has-icon' : ''}`}
            rows={4}
            {...props}
          />
        ) : (
          <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`input-field ${icon ? 'has-icon' : ''}`}
            {...props}
          />
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Input;
