import React from 'react';
import { getFundingStatus } from '../../utils/allocation';

interface ProgressBarProps {
  allocatedPaise: number;
  pricePaise: number;
  showPercent?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const heightClasses = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function ProgressBar({ allocatedPaise, pricePaise, showPercent = false, height = 'md' }: ProgressBarProps) {
  const percent = pricePaise === 0 ? 0 : Math.min(100, (allocatedPaise / pricePaise) * 100);
  const status = getFundingStatus(allocatedPaise, pricePaise);

  /* Bar fill color — vivid enough to be visible in both themes */
  const barColor =
    status === 'overfunded'    ? '#8b5cf6' :
    status === 'fully_funded'  ? '#10b981' :
    status === 'partially_funded' ? '#0ea5e9' :
    'transparent';

  return (
    <div className="w-full">
      <div
        className={`w-full rounded-full overflow-hidden ${heightClasses[height]}`}
        style={{ backgroundColor: 'var(--bar-track)' }}   /* ← uses CSS token, adapts to dark */
      >
        <div
          className="progress-bar-fill h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: barColor }}
        />
      </div>
      {showPercent && (
        <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>
          {percent.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
