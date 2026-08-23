import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Select Component
 */
export default function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  children,
  placeholder = 'Select an option',
  placeholderDisabled = false,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const selectId = id || name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          <span>
            {label}
            {required && <span className="required-mark">*</span>}
          </span>
        </label>
      )}

      <div className="input-wrapper">
        <select
          id={selectId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`form-control select-control ${error ? 'is-invalid' : ''}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={placeholderDisabled}>
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt, idx) => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={idx} value={optVal}>
                    {optLabel}
                  </option>
                );
              })
            : children}
        </select>
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
