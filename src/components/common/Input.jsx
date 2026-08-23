import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Reusable Input Component
 */
export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  iconStart = null,
  iconEnd = null,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || Math.random().toString(36).substring(2, 9);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          <span>
            {label}
            {required && <span className="required-mark">*</span>}
          </span>
        </label>
      )}

      <div className="input-wrapper">
        {iconStart && <span className="input-icon-start">{iconStart}</span>}
        
        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`form-control ${iconStart ? 'has-start-icon' : ''} ${
            iconEnd || isPassword ? 'has-end-icon' : ''
          } ${error ? 'is-invalid' : ''}`}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            className="input-icon-end"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : (
          iconEnd && <span className="input-icon-end">{iconEnd}</span>
        )}
      </div>

      {error ? (
        <div className="form-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : (
        helperText && <p className="form-helper">{helperText}</p>
      )}
    </div>
  );
}
