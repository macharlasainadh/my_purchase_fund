import React from 'react';
import {
  ArrowRight, ShieldCheck, CheckCircle2, Sparkles,
  Wallet, Database, Layers, ShoppingCart, ExternalLink,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface HeroSectionProps {
  onOpenApp: () => void;
}

export function HeroSection({ onOpenApp }: HeroSectionProps) {
  function scrollToExplore(e: React.MouseEvent) {
    e.preventDefault();
    const el = document.querySelector('#how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
      {/* Background Glow Elements */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[850px] h-[350px] sm:h-[450px] rounded-full blur-3xl opacity-20 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, #a855f7 40%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Hero Typography */}
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border shadow-xs"
            style={{
              backgroundColor: 'var(--accent-fund-bg)',
              borderColor: 'color-mix(in srgb, var(--accent-fund) 25%, transparent)',
              color: 'var(--accent-fund)',
            }}
          >
            <Sparkles size={13} />
            <span>Intentional Purchase Planner</span>
          </div>

          {/* Headline */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-5 text-balance"
            style={{ color: 'var(--text)' }}
          >
            Turn Wishlists Into Plans.{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Fund Purchases With Purpose.
            </span>
          </h1>

          {/* Subheadline (Exact user requested wording) */}
          <p
            className="text-base sm:text-lg lg:text-xl font-normal leading-relaxed mb-8 max-w-2xl"
            style={{ color: 'var(--text-muted)' }}
          >
            Organize what you want to buy, decide where your money goes, and track your progress until you're ready to purchase.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-10">
            <button
              onClick={onOpenApp}
              className="w-full sm:w-auto h-13 px-8 rounded-2xl text-base font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <span>Start Planning — Open App</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#how-it-works"
              onClick={scrollToExplore}
              className="w-full sm:w-auto h-13 px-6 rounded-2xl text-base font-semibold border transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
              }}
            >
              <span>Explore Features</span>
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Trust Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>100% Free & No Sign-up</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-indigo-500" />
              <span>Local-First & Private</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Installable Offline PWA</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO APPLICATION PREVIEW (Authentic Replica of Real Application UI)        */}
        {/* ========================================================================= */}
        <div className="mt-14 sm:mt-18 relative max-w-5xl mx-auto">
          {/* Browser frame decoration */}
          <div
            className="rounded-3xl shadow-2xl overflow-hidden border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Window header */}
            <div
              className="h-10 px-4 flex items-center justify-between border-b"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div
                className="px-4 py-1 rounded-md text-[11px] font-mono border"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                mypurchasefund.app
              </div>
              <div className="w-12" />
            </div>

            {/* Simulated Real App Content */}
            <div className="p-4 sm:p-6 flex flex-col gap-6" style={{ backgroundColor: 'var(--bg)' }}>
              {/* Fund Summary Cards Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {/* Total Fund */}
                <div
                  className="p-3 rounded-2xl flex items-center gap-2.5 border"
                  style={{
                    backgroundColor: 'var(--accent-fund-bg)',
                    borderColor: 'color-mix(in srgb, var(--accent-fund) 25%, transparent)',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-fund) 20%, transparent)' }}>
                    <Wallet size={16} style={{ color: 'var(--accent-fund)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--accent-fund)' }}>Total Fund</p>
                    <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--accent-fund)' }}>₹1,50,000</p>
                  </div>
                </div>

                {/* Allocated */}
                <div
                  className="p-3 rounded-2xl flex items-center gap-2.5 border"
                  style={{
                    backgroundColor: 'var(--accent-allocated-bg)',
                    borderColor: 'color-mix(in srgb, var(--accent-allocated) 25%, transparent)',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-allocated) 20%, transparent)' }}>
                    <Database size={16} style={{ color: 'var(--accent-allocated)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--accent-allocated)' }}>Allocated</p>
                    <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--accent-allocated)' }}>₹98,000</p>
                  </div>
                </div>

                {/* Unallocated */}
                <div
                  className="p-3 rounded-2xl flex items-center gap-2.5 border"
                  style={{
                    backgroundColor: 'var(--accent-free-bg)',
                    borderColor: 'color-mix(in srgb, var(--accent-free) 25%, transparent)',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-free) 20%, transparent)' }}>
                    <Layers size={16} style={{ color: 'var(--accent-free)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--accent-free)' }}>Unallocated</p>
                    <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--accent-free)' }}>₹52,000</p>
                  </div>
                </div>

                {/* Total Required */}
                <div
                  className="p-3 rounded-2xl flex items-center gap-2.5 border"
                  style={{
                    backgroundColor: 'var(--accent-required-bg)',
                    borderColor: 'color-mix(in srgb, var(--accent-required) 25%, transparent)',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-required) 20%, transparent)' }}>
                    <ShoppingCart size={16} style={{ color: 'var(--accent-required)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--accent-required)' }}>Total Required</p>
                    <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--accent-required)' }}>₹1,24,970</p>
                  </div>
                </div>

                {/* Progress */}
                <div
                  className="p-3 rounded-2xl flex items-center gap-2.5 border col-span-2 sm:col-span-1"
                  style={{
                    backgroundColor: 'var(--accent-progress-bg)',
                    borderColor: 'color-mix(in srgb, var(--accent-progress) 25%, transparent)',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-progress) 20%, transparent)', color: 'var(--accent-progress)' }}>
                    78%
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--accent-progress)' }}>Goal Progress</p>
                    <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--accent-progress)' }}>78.4% Covered</p>
                  </div>
                </div>
              </div>

              {/* Sample Product Cards Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product 1: Sony Headphones (Fully Funded) */}
                <div
                  className="rounded-2xl border p-4 flex flex-col justify-between shadow-xs"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--status-funded-text)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                        ✓ Fully Funded
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                        High Priority
                      </span>
                    </div>
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                      Sony WH-1000XM5
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Electronics · Target: Diwali</p>
                    <p className="text-base font-bold mt-2" style={{ color: 'var(--text)' }}>₹29,990</p>
                  </div>

                  <div className="mt-3 pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-full rounded-full" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-600">₹29,990 allocated</span>
                      <span className="text-[11px] font-semibold text-emerald-600">Ready to Buy</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] inline-flex items-center gap-1">
                        Amazon <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product 2: Standing Desk (Saving) */}
                <div
                  className="rounded-2xl border p-4 flex flex-col justify-between shadow-xs"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--status-saving-text)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 dark:bg-sky-950 dark:text-sky-300">
                        Saving
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
                        Critical
                      </span>
                    </div>
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                      Ergonomic Standing Desk
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Workspace · Dual Motor</p>
                    <p className="text-base font-bold mt-2" style={{ color: 'var(--text)' }}>₹34,990</p>
                  </div>

                  <div className="mt-3 pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full w-[71%] rounded-full" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-sky-600">₹25,000 allocated</span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>₹9,990 left</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] inline-flex items-center gap-1">
                        ErgoSmart <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product 3: iPad Air M2 (Saving) */}
                <div
                  className="rounded-2xl border p-4 flex flex-col justify-between shadow-xs"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 dark:bg-sky-950 dark:text-sky-300">
                        Saving
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-sky-700 bg-sky-100 dark:bg-sky-950 dark:text-sky-300">
                        Medium
                      </span>
                    </div>
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                      iPad Air M2 (128GB)
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Tech · For Design Work</p>
                    <p className="text-base font-bold mt-2" style={{ color: 'var(--text)' }}>₹59,990</p>
                  </div>

                  <div className="mt-3 pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full w-[72%] rounded-full" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-sky-600">₹43,010 allocated</span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>₹16,980 left</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] inline-flex items-center gap-1">
                        Apple Store <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Badge Callout */}
          <div
            onClick={onOpenApp}
            className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full border shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 z-20"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <span>Live Interactive Demo</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-indigo-500 flex items-center">Open App <ArrowUpRight size={14} className="ml-0.5" /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
