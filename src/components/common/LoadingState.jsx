import React from 'react';

/**
 * Reusable LoadingState Component
 */
export default function LoadingState({
  message = 'Loading data, please wait...',
  size = 'md',
  className = '',
}) {
  const spinnerSize = size === 'sm' ? 28 : size === 'lg' ? 56 : 40;

  return (
    <div className={`loading-state ${className}`.trim()}>
      <div
        className="civic-spinner"
        style={{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }}
        aria-hidden="true"
      />
      {message && <p className="loading-text">{message}</p>}
    </div>
  );
}
