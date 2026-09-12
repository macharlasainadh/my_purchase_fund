import React, { useState } from 'react';
import {
  Layers, Package, Equal, PieChart, Sliders, ArrowRightLeft,
  Check, ArrowRight, Wallet, Sparkles, RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

type MethodType = 'unallocated' | 'single' | 'equal' | 'percentage' | 'custom';

export function AllocationHeroSection() {
  const [selectedMethod, setSelectedMethod] = useState<MethodType>('percentage');

  const methods: {
    id: MethodType;
    title: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'percentage',
      title: 'Allocate by Percentage',
      badge: 'Most Popular',
      desc: 'Set custom percentage weights across products with live rupee calculations.',
      icon: <PieChart size={18} className="text-purple-500" />,
    },
    {
      id: 'single',
      title: 'Allocate to One Product',
      badge: 'Targeted Boost',
      desc: 'Channel 100% of the newly added money directly into your highest priority purchase.',
      icon: <Package size={18} className="text-indigo-500" />,
    },
    {
      id: 'equal',
      title: 'Distribute Equally',
      badge: 'Balanced Growth',
      desc: 'Divides the deposit equally among all active products with exact paise precision.',
      icon: <Equal size={18} className="text-emerald-500" />,
    },
    {
      id: 'custom',
      title: 'Custom Allocation',
      badge: 'Total Control',
      desc: 'Specify exact rupee amounts for individual products with live remaining balance tracking.',
      icon: <Sliders size={18} className="text-sky-500" />,
    },
    {
      id: 'unallocated',
      title: 'Keep Unallocated',
      badge: 'Flexible Pool',
      desc: 'Hold money in your free fund to assign, move, or distribute at a later time.',
      icon: <Layers size={18} className="text-slate-500" />,
    },
  ];

  // Visual simulation for the selected method based on adding ₹10,000
  const previewData: Record<
    MethodType,
    {
      methodName: string;
      items: { name: string; addedPaise: number; pct: string; note?: string }[];
      unallocatedPaise: number;
    }
  > = {
    percentage: {
      methodName: 'Percentage Split (60% / 40%)',
      items: [
        { name: 'Sony WH-1000XM5 Headphones', addedPaise: 600000, pct: '60%' },
        { name: 'Ergonomic Standing Desk', addedPaise: 400000, pct: '40%' },
      ],
      unallocatedPaise: 0,
    },
    single: {
      methodName: '100% to Highest Priority',
      items: [
        { name: 'Ergonomic Standing Desk', addedPaise: 1000000, pct: '100%', note: 'Critical priority boosted' },
      ],
      unallocatedPaise: 0,
    },
    equal: {
      methodName: 'Equal Split across 2 items',
      items: [
        { name: 'Sony WH-1000XM5 Headphones', addedPaise: 500000, pct: '50%' },
        { name: 'Ergonomic Standing Desk', addedPaise: 500000, pct: '50%' },
      ],
      unallocatedPaise: 0,
    },
    custom: {
      methodName: 'Custom Amounts Specified',
      items: [
        { name: 'Sony WH-1000XM5 Headphones', addedPaise: 700000, pct: '70%' },
        { name: 'Ergonomic Standing Desk', addedPaise: 200000, pct: '20%' },
      ],
      unallocatedPaise: 100000, // ₹1,000 left unallocated
    },
    unallocated: {
      methodName: 'Held in Free Fund',
      items: [],
      unallocatedPaise: 1000000, // ₹10,000 stays unallocated
    },
  };

  const activePreview = previewData[selectedMethod];

  return (
    <section id="allocation" className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-500 mb-2 border"
            style={{
              backgroundColor: 'var(--accent-fund-bg)',
              borderColor: 'color-mix(in srgb, var(--accent-fund) 25%, transparent)',
            }}
          >
            <Sparkles size={12} />
            <span>The Core Differentiator</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Smart Fund Allocation Engine
          </h2>
          <p className="text-sm sm:text-base mt-3" style={{ color: 'var(--text-muted)' }}>
            Don't just add money to an arbitrary balance. You decide exactly where your money goes with 5 purposeful allocation workflows.
          </p>
        </div>

        {/* Interactive Allocation Flow Showcase */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Method Selector */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Choose Allocation Method:
            </p>

            {methods.map((m) => {
              const active = selectedMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    active
                      ? 'ring-2 ring-indigo-500 shadow-md -translate-y-0.5'
                      : 'hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  style={{
                    backgroundColor: active ? 'var(--surface)' : 'var(--surface-2)',
                    borderColor: active ? 'var(--accent-fund)' : 'var(--border)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: active
                        ? 'var(--accent-fund-bg)'
                        : 'var(--surface-3)',
                    }}
                  >
                    {m.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                        {m.title}
                      </h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: active ? 'var(--accent-fund-bg)' : 'var(--surface-3)',
                          color: active ? 'var(--accent-fund)' : 'var(--text-muted)',
                        }}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs mt-1 leading-normal" style={{ color: 'var(--text-muted)' }}>
                      {m.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Visual Result Flow Simulation */}
          <div className="lg:col-span-6">
            <div
              className="rounded-3xl border p-6 sm:p-8 shadow-xl flex flex-col gap-5 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              {/* Step 1: Simulated Input */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                    +₹
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Added to Fund</p>
                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">₹10,000</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-indigo-100 text-indigo-600">
                    Step 1 of 4
                  </span>
                </div>
              </div>

              {/* Connecting arrow */}
              <div className="flex justify-center -my-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-500 font-bold text-xs">
                  ↓
                </div>
              </div>

              {/* Step 2: Selected Method Result */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {activePreview.methodName}
                  </p>
                  <span className="text-xs font-semibold text-emerald-600">
                    Balanced & Verified ✓
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {activePreview.items.map((item) => (
                    <div
                      key={item.name}
                      className="p-3.5 rounded-xl border flex items-center justify-between"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>
                          {item.name}
                        </p>
                        {item.note && (
                          <p className="text-[10px] text-rose-500 font-semibold">{item.note}</p>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                          {item.pct}
                        </span>
                        <span className="text-xs font-extrabold text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                          +{formatCurrency(item.addedPaise)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {activePreview.unallocatedPaise > 0 && (
                    <div
                      className="p-3.5 rounded-xl border flex items-center justify-between"
                      style={{
                        backgroundColor: 'var(--accent-free-bg)',
                        borderColor: 'color-mix(in srgb, var(--accent-free) 30%, transparent)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Layers size={14} style={{ color: 'var(--accent-free)' }} />
                        <span className="text-xs font-bold" style={{ color: 'var(--accent-free)' }}>
                          Stays Unallocated (Free Balance)
                        </span>
                      </div>
                      <span className="text-xs font-extrabold" style={{ color: 'var(--accent-free)' }}>
                        +{formatCurrency(activePreview.unallocatedPaise)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Features Callout Strip */}
              <div
                className="mt-2 pt-4 border-t flex flex-wrap items-center justify-between gap-2 text-xs"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <div className="flex items-center gap-1.5">
                  <ArrowRightLeft size={13} className="text-indigo-500" />
                  <span><strong>Move Money:</strong> Transfer between products anytime</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw size={13} className="text-amber-500" />
                  <span><strong>Redistribute:</strong> Rebalance previously allocated funds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
