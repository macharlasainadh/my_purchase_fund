import React from 'react';
import { Target, Trophy, Calendar, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export function GoalsSectionPreview() {
  return (
    <section id="goals" className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
            Long-Term Financial Horizons
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Plan Beyond Immediate Wishlists
          </h2>
          <p className="text-sm sm:text-base mt-3" style={{ color: 'var(--text-muted)' }}>
            Some milestones take months or years. Create long-term savings goals with automated monthly planning, target deadlines, and progress celebrations.
          </p>
        </div>

        {/* Goals Grid Showcase */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Goal 1: MacBook Pro / Tech Upgrade */}
          <div
            className="rounded-3xl border shadow-lg overflow-hidden flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'color-mix(in srgb, #6366f1 40%, transparent)',
            }}
          >
            {/* Top Stripe */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#6366f118' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💻</span>
                <div>
                  <h3 className="font-bold text-base" style={{ color: '#6366f1' }}>
                    New Workstation Setup
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Tech Upgrade · For Freelance Work
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-indigo-500">
                High Priority
              </span>
            </div>

            {/* Middle Stats */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Saved So Far</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    ₹60,000
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Target Amount</p>
                  <p className="text-base font-bold" style={{ color: 'var(--text)' }}>
                    ₹1,20,000
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-indigo-500 h-full w-[50%] rounded-full" />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-600">50.0% achieved</span>
                  <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>₹60,000 remaining</span>
                </div>
              </div>

              {/* Automatic Pace Breakdown */}
              <div
                className="grid grid-cols-2 gap-2 p-3 rounded-2xl border text-xs"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <div>
                  <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Target Date</span>
                  <strong className="font-semibold flex items-center gap-1 mt-0.5" style={{ color: 'var(--text)' }}>
                    <Calendar size={12} className="text-indigo-500" /> Dec 31, 2026
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Monthly Plan Needed</span>
                  <strong className="font-semibold flex items-center gap-1 mt-0.5 text-indigo-600">
                    <TrendingUp size={12} /> ₹10,000 / month
                  </strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t text-xs flex items-center justify-between text-indigo-600 font-semibold" style={{ borderColor: 'var(--border)' }}>
              <span>6 contributions logged</span>
              <span>On track to reach goal ✓</span>
            </div>
          </div>

          {/* Goal 2: Emergency Fund (Achieved!) */}
          <div
            className="rounded-3xl border shadow-lg overflow-hidden flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'color-mix(in srgb, #10b981 40%, transparent)',
            }}
          >
            {/* Top Stripe */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#10b98118' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h3 className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    Emergency Safety Fund
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Financial Security · 6 Months Buffer
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-emerald-500 shadow-xs">
                <Trophy size={13} /> Achieved!
              </span>
            </div>

            {/* Middle Stats */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Saved</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹1,50,000
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Target</p>
                  <p className="text-base font-bold text-emerald-600">
                    ₹1,50,000
                  </p>
                </div>
              </div>

              {/* Progress Bar (Full) */}
              <div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-600">100% Fully Funded</span>
                  <span className="font-bold text-emerald-600">Goal Complete 🎉</span>
                </div>
              </div>

              {/* Automatic Pace Breakdown */}
              <div
                className="grid grid-cols-2 gap-2 p-3 rounded-2xl border text-xs"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <div>
                  <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Achieved Date</span>
                  <strong className="font-semibold flex items-center gap-1 mt-0.5 text-emerald-600">
                    <CheckCircle2 size={12} /> Target Reached Early
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Status</span>
                  <strong className="font-semibold flex items-center gap-1 mt-0.5 text-emerald-600">
                    Protected & Intact
                  </strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t text-xs flex items-center justify-between text-emerald-600 font-semibold" style={{ borderColor: 'var(--border)' }}>
              <span>12 contributions completed</span>
              <span>Fully secured in fund</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
