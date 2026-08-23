import React from 'react';

/**
 * Reusable Card Component
 */
export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`card-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export default function Card({
  children,
  header,
  footer,
  interactive = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      className={`card ${interactive ? 'card-interactive' : ''} ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {header && (
        <div className="card-header">
          {typeof header === 'string' ? <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{header}</h3> : header}
        </div>
      )}
      
      {/* If children already include subcomponents CardBody, render directly; otherwise wrap in card-body */}
      {React.Children.toArray(children).some(
        child => React.isValidElement(child) && (child.type === CardBody || child.type === CardHeader || child.type === CardFooter)
      ) ? (
        children
      ) : (
        <div className="card-body">{children}</div>
      )}

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
