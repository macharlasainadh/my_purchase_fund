import React from 'react';
import { XCircle, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export function ProblemSection() {
  return (
    <section className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
            The Problem With Saving In A Lump Sum
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            When savings lack a plan, spending becomes impulsive.
          </h2>
          <p className="text-sm sm:text-base mt-3" style={{ color: 'var(--text-muted)' }}>
            Most people save money in a single bank balance with multiple wishlists in their head. Without dedicated allocation, you never truly know what you can afford to buy today without sacrificing tomorrow's priorities.
          </p>
        </div>

        {/* Contrast Grid: Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Card 1: The Usual Way (Chaotic) */}
          <div
            className="rounded-3xl p-6 sm:p-8 border flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'color-mix(in srgb, #ef4444 30%, transparent)',
            }}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-500 flex-shrink-0">
                  <XCircle size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                  Saving Without a Plan
                </h3>
              </div>

              <ul className="flex flex-col gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <div>
                    <strong className="font-semibold" style={{ color: 'var(--text)' }}>One ambiguous balance:</strong> You have ₹50,000 saved, but don't know how much is for a laptop, a holiday, or routine expenses.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <div>
                    <strong className="font-semibold" style={{ color: 'var(--text)' }}>Impulsive buyer's remorse:</strong> Buying an item on a whim because you have the cash, only to realize later you delayed a higher priority.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <div>
                    <strong className="font-semibold" style={{ color: 'var(--text)' }}>Scattered links & notes:</strong> Wishlist URLs, discount notes, and target dates are lost across browser bookmarks and notes apps.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <div>
                    <strong className="font-semibold" style={{ color: 'var(--text)' }}>Zero clarity on progress:</strong> You have no idea what percentage of your purchase goal is funded or how much is still needed.
                  </div>
                </li>
              </ul>
            </div>

            <div
              className="mt-6 pt-4 border-t text-xs font-medium text-red-500 flex items-center gap-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <AlertCircle size={14} />
              <span>Result: Accidental overspending & delayed goals</span>
            </div>
          </div>

          {/* Card 2: The Purchase Fund Way (Intentional) */}
          <div
            className="rounded-3xl p-6 sm:p-8 border shadow-lg flex flex-col justify-between relative overflow-hidden"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'color-mix(in srgb, #6366f1 40%, transparent)',
            }}
          >
            {/* Top accent badge */}
            <div
              className="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[11px] font-bold text-white bg-indigo-500"
            >
              Intentional
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  The My Purchase Fund Way
                </h3>
              </div>

              <ul className="flex flex-col gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold" style={{ color: 'var(--text)' }}>Targeted fund allocation:</strong> Every rupee is assigned to a specific product or held in a transparent unallocated pool.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold" style={{ color: 'var(--text)' }}>Priority-guided decisions:</strong> Critical, High, Medium, and Low priorities ensure essential items get funded first.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold" style={{ color: 'var(--text)' }}>All product info together:</strong> Save multiple retailer links (Amazon, Flipkart), images, notes, and target purchase dates in one card.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold" style={{ color: 'var(--text)' }}>Confident purchasing:</strong> Clear progress rings tell you the instant an item reaches 100% funding so you can buy guilt-free.
                  </div>
                </li>
              </ul>
            </div>

            <div
              className="mt-6 pt-4 border-t text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <CheckCircle2 size={14} />
              <span>Result: Disciplined saving, zero guilt, and planned purchases</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
