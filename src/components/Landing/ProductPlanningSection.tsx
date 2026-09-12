import React from 'react';
import { ExternalLink, Tag, Calendar, StickyNote, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function ProductPlanningSection() {
  return (
    <section id="products" className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
            Structured Wishlist Planning
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Keep all purchase details in one place.
          </h2>
          <p className="text-sm sm:text-base mt-3" style={{ color: 'var(--text-muted)' }}>
            Never lose a shopping URL, target date, or research note again. Every item lives on a dedicated card complete with funding progress.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Authentic Product Card Showcase */}
          <div className="lg:col-span-7">
            <div
              className="rounded-3xl border shadow-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--status-saving-text)',
              }}
            >
              {/* Product Header Bar */}
              <div
                className="px-5 py-2.5 text-xs font-bold flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--status-saving-bg)',
                  color: 'var(--status-saving-text)',
                }}
              >
                <span>Status: In Progress (Saving)</span>
                <span>71.4% Funded</span>
              </div>

              <div className="p-6 sm:p-7 flex flex-col gap-4">
                {/* Title & Price */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text)' }}>
                      Sony WH-1000XM5 Headphones
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                        High Priority
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 inline-flex items-center gap-1">
                        <Tag size={11} />
                        Audio Equipment
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 inline-flex items-center gap-1">
                        <Calendar size={11} />
                        Target: Oct 25, 2026
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text)' }}>
                      ₹29,990
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>estimated price</p>
                  </div>
                </div>

                {/* Progress Bar & Allocation Breakdown */}
                <div className="pt-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
                    <div className="bg-sky-500 h-full w-[71.4%] rounded-full transition-all" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-600">₹21,410 allocated</span>
                    <span className="font-semibold text-rose-500">₹8,580 remaining</span>
                  </div>
                </div>

                {/* Notes */}
                <div
                  className="p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <StickyNote size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span>
                    "Wait for the annual festive sale. Check if silver or black color has higher instant bank discount."
                  </span>
                </div>

                {/* Shopping Links List */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Saved Retailer Links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 border-[var(--border)] text-indigo-600 shadow-xs">
                      Amazon India <ExternalLink size={12} />
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 border-[var(--border)] text-indigo-600 shadow-xs">
                      Flipkart <ExternalLink size={12} />
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-900 border-[var(--border)] text-indigo-600 shadow-xs">
                      Sony Center Official <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Why it matters */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>
              No more fragmented spreadsheets or forgotten bookmarks.
            </h3>

            <div className="flex flex-col gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block" style={{ color: 'var(--text)' }}>Multiple Online Shopping Links:</strong>
                  Store Amazon, Flipkart, or official store links directly on the product card so you can compare deals immediately.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block" style={{ color: 'var(--text)' }}>Priority-Based Clarity:</strong>
                  Tag each product Critical, High, Medium, or Low to quickly know which items should receive upcoming allocations.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block" style={{ color: 'var(--text)' }}>Target Dates & Overdue Alerts:</strong>
                  Set ideal purchase dates and get clear overdue indicators if a target date passes before funding is complete.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block" style={{ color: 'var(--text)' }}>Dynamic Price Updates:</strong>
                  If an item drops in price during a sale, update the price and decide whether to return excess funds or keep them assigned.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
