import React from 'react';

/**
 * Reusable Button Component
 * @param {'primary'|'secondary'|'accent'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} fullWidth
 * @param {boolean} loading
 * @param {React.ReactNode} iconStart
 * @param {React.ReactNode} iconEnd
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  iconStart = null,
  iconEnd = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const fullWidthClass = fullWidth ? 'btn-full' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim()}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {iconStart && <span className="btn-icon-start">{iconStart}</span>}
          {children}
          {iconEnd && <span className="btn-icon-end">{iconEnd}</span>}
        </>
      )}
    </button>
  );
}
