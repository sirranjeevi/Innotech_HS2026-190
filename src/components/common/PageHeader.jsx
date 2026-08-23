import React from 'react';

/**
 * Reusable PageHeader Component
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  breadcrumbs,
  className = '',
}) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div>
        {breadcrumbs && <div style={{ marginBottom: '8px' }}>{breadcrumbs}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 className="page-header-title">{title}</h1>
          {badge && <div>{badge}</div>}
        </div>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
