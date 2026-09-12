import React from 'react';
import { ShoppingBag, History, Check, ArrowRight, RotateCcw, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export function HistorySection() {
  return (
    <section className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
            The Complete Lifecycle
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Plan, purchase, and remember your journey.
          </h2>
          <p className="text-sm sm:text-base mt-3" style={{ color: 'var(--text-muted)' }}>
            Your financial decisions shouldn't disappear after buying. Track what you paid, celebrate the money you saved below estimate, and review an immutable audit log.
          </p>
        </div>

        {/* 2 Column Showcase */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Purchased Showcase Card */}
          <div
            className="rounded-3xl border p-6 sm:p-7 shadow-lg flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'color-mix(in srgb, #10b981 40%, transparent)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                    <ShoppingBag size={18} />
                  </div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>
                    Purchased Showcase
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Total Spent: ₹1,24,500
                </span>
              </div>

              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                When you buy an item, record the actual price paid. If you purchased during a sale and paid less than estimated, the excess allocated cash is returned back to your unallocated fund!
              </p>

              {/* Sample Purchased Product */}
              <div
                className="p-4 rounded-2xl border flex flex-col gap-2"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      ✔ Purchased on Amazon
                    </span>
                    <h4 className="font-bold text-sm mt-0.5" style={{ color: 'var(--text)' }}>
                      Dell UltraSharp 27" 4K Monitor
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">₹42,990</p>
                    <p className="text-[11px] line-through" style={{ color: 'var(--text-muted)' }}>₹48,000</p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="flex items-center gap-1">
                    <TrendingDown size={14} /> You saved ₹5,010 below estimate!
                  </span>
                  <span className="text-[11px] opacity-80">Returned to fund</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <span>Includes Symmetrical Restore if marked by mistake</span>
              <RotateCcw size={13} className="text-indigo-500" />
            </div>
          </div>

          {/* Audit History Card */}
          <div
            className="rounded-3xl border p-6 sm:p-7 shadow-lg flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                    <History size={18} />
                  </div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>
                    Complete Transaction Log
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Audit Trail
                </span>
              </div>

              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                Every financial event is recorded with an exact timestamp and description. Never wonder where your money went or why an allocation changed.
              </p>

              {/* Sample Timeline Entries */}
              <div className="flex flex-col gap-2">
                <div
                  className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>Added ₹25,000 via Percentage Allocation</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Today · 2:15 PM</p>
                  </div>
                  <span className="font-bold text-sky-600">+₹25,000</span>
                </div>

                <div
                  className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>Moved ₹5,000 to Standing Desk</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Yesterday · 6:40 PM</p>
                  </div>
                  <span className="font-bold text-purple-600">Transfer</span>
                </div>

                <div
                  className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>Contributed ₹10,000 to Emergency Fund</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sep 8, 2026 · 11:30 AM</p>
                  </div>
                  <span className="font-bold text-emerald-600">Goal +₹10,000</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <span>Searchable & filterable by event category</span>
              <span className="font-semibold text-indigo-500">100% Traceable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
