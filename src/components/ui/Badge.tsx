import React from 'react';
import type { Priority, ProductStatus, FundingStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'priority' | 'status' | 'funding' | 'category';
  priority?: Priority;
  status?: ProductStatus;
  funding?: FundingStatus;
  className?: string;
}

const statusLabels: Record<ProductStatus, string> = {
  wishlist:     '◇ Wishlist',
  saving:       '◎ Saving',
  fully_funded: '✓ Fully Funded',
  purchased:    '✔ Purchased',
};

const fundingLabels: Record<FundingStatus, string> = {
  not_funded:       'Not Funded',
  partially_funded: 'Partially Funded',
  fully_funded:     '✓ Fully Funded',
  overfunded:       '↑ Overfunded',
};

export function Badge({ children, variant, priority, status, funding, className = '' }: BadgeProps) {
  let style: React.CSSProperties = {};
  let label: React.ReactNode = children;

  if (variant === 'priority' && priority) {
    style = {
      backgroundColor: `var(--priority-${priority}-bg)`,
      color: `var(--priority-${priority}-text)`,
    };
    label = `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`;
  } else if (variant === 'status' && status) {
    style = {
      backgroundColor: `var(--status-${status.replace('_', '-')}-bg)`,
      color: `var(--status-${status.replace('_', '-')}-text)`,
    };
    label = statusLabels[status];
  } else if (variant === 'funding' && funding) {
    const map: Record<FundingStatus, string> = {
      not_funded:       'wishlist',
      partially_funded: 'saving',
      fully_funded:     'funded',
      overfunded:       'purchased',
    };
    style = {
      backgroundColor: `var(--status-${map[funding]}-bg)`,
      color: `var(--status-${map[funding]}-text)`,
    };
    label = fundingLabels[funding];
  } else {
    style = { backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)' };
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={style}
    >
      {label}
    </span>
  );
}
