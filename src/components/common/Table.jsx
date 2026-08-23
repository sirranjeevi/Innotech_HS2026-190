import React from 'react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

/**
 * Reusable Table Component
 */
export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  emptyTitle = 'No Data Available',
  onRowClick,
  className = '',
  children,
}) {
  if (loading) {
    return (
      <div className="table-container" style={{ padding: '40px' }}>
        <LoadingState message="Loading records..." />
      </div>
    );
  }

  if (children) {
    return (
      <div className={`table-container ${className}`.trim()}>
        <table className="table">{children}</table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <EmptyState title={emptyTitle} description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`.trim()}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col, colIdx) => (
                <td key={col.key || colIdx} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
