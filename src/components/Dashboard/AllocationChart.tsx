import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePurchaseStore, selectFundSummary } from '../../store/usePurchaseStore';
import { formatCurrency } from '../../utils/currency';

const COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#6366f1',
];

const UNALLOCATED_COLOR = '#e2e8f0';

interface ChartEntry {
  name: string;
  valuePaise: number;
  percent: number;
  color?: string;
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const paise = entry.value;
    const pct = entry.payload?.percent ?? 0;
    return (
      <div className="rounded-xl shadow-lg px-3 py-2 text-sm"
           style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="font-semibold" style={{ color: 'var(--text)' }}>{entry.name}</p>
        <p style={{ color: 'var(--text-muted)' }}>{formatCurrency(paise)} ({pct}%)</p>
      </div>
    );
  }
  return null;
}

export function AllocationChart() {
  const store = usePurchaseStore();
  const summary = selectFundSummary(store);
  const { products, goals, totalFundPaise } = store;

  if (totalFundPaise === 0) return null;

  const chartEntries: ChartEntry[] = products
    .filter((p) => p.allocatedPaise > 0)
    .map((p) => ({
      name: p.name,
      valuePaise: p.allocatedPaise,
      percent: Math.round((p.allocatedPaise / totalFundPaise) * 1000) / 10,
    }));

  (goals ?? [])
    .filter((g) => g.savedAmountPaise > 0)
    .forEach((g) => {
      chartEntries.push({
        name: `Goal: ${g.name}`,
        valuePaise: g.savedAmountPaise,
        percent: Math.round((g.savedAmountPaise / totalFundPaise) * 1000) / 10,
        color: g.color,
      });
    });

  if (summary.unallocatedPaise > 0) {
    chartEntries.push({
      name: 'Unallocated',
      valuePaise: summary.unallocatedPaise,
      percent: Math.round((summary.unallocatedPaise / totalFundPaise) * 1000) / 10,
    });
  }

  if (chartEntries.length === 0) return null;

  const data = chartEntries.map((e) => ({
    name: e.name,
    value: e.valuePaise,
    percent: e.percent,
    color: e.color,
  }));

  return (
    <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
        Fund Allocation
      </h3>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div style={{ width: '100%', maxWidth: 260, height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'Unallocated'
                        ? UNALLOCATED_COLOR
                        : (entry.color || COLORS[index % COLORS.length])
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 flex-1">
          {chartEntries.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    entry.name === 'Unallocated'
                      ? UNALLOCATED_COLOR
                      : (entry.color || COLORS[index % COLORS.length]),
                }}
              />
              <span style={{ color: 'var(--text-muted)' }}>
                {entry.name} — {entry.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
