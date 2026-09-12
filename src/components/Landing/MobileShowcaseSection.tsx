import React from 'react';
import { Smartphone, Check, ArrowRight, Layers, PlusCircle, CheckCircle2 } from 'lucide-react';

export function MobileShowcaseSection() {
  return (
    <section className="py-16 sm:py-24 border-t overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Mobile App Feature Highlights */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-500 border w-fit"
              style={{
                backgroundColor: 'var(--accent-fund-bg)',
                borderColor: 'color-mix(in srgb, var(--accent-fund) 25%, transparent)',
              }}
            >
              <Smartphone size={13} />
              <span>Native Mobile Experience</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              Built like a real mobile app. Not a squeezed desktop site.
            </h2>

            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              When you open My Purchase Fund on your smartphone, every workflow adapts into a dedicated full-screen mobile application page with native navigation, thumb-friendly touch targets, and zero horizontal squishing.
            </p>

            <div className="flex flex-col gap-3.5 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block" style={{ color: 'var(--text)' }}>Dedicated Full-Screen Pages:</strong>
                  Forms like Add Money, Add Product, and Goal creation open as complete screens with back navigation and clear step indicators.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block" style={{ color: 'var(--text)' }}>Thumb-Friendly Action Bars:</strong>
                  Sticky 48px action buttons stay anchored within reach at the bottom of the viewport so you never struggle to tap confirm or save.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block" style={{ color: 'var(--text)' }}>Bottom Tab Bar Navigation:</strong>
                  Quickly switch between Products, Goals, History, and Purchased items using a native-style bottom navigation bar.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Phone Mockup Representation */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              className="w-full max-w-[310px] sm:max-w-[340px] rounded-[42px] border-[6px] border-slate-800 dark:border-slate-700 shadow-2xl p-3 flex flex-col gap-3 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--surface)',
              }}
            >
              {/* Phone Speaker & Camera Notch */}
              <div className="w-28 h-4 bg-slate-800 dark:bg-slate-700 rounded-full mx-auto -mt-1 flex-shrink-0" />

              {/* Simulated Mobile App Header */}
              <div
                className="p-3 rounded-2xl border flex items-center justify-between shadow-xs"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                    <span className="text-xs font-bold">₹</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>My Purchase Fund</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-500 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950">
                  Mobile App
                </span>
              </div>

              {/* Mobile Hero Balance Card */}
              <div
                className="p-3.5 rounded-2xl border flex flex-col gap-1 shadow-xs"
                style={{
                  backgroundColor: 'var(--accent-fund-bg)',
                  borderColor: 'color-mix(in srgb, var(--accent-fund) 25%, transparent)',
                }}
              >
                <div className="flex justify-between items-center text-[11px] font-semibold" style={{ color: 'var(--accent-fund)' }}>
                  <span>TOTAL FUND</span>
                  <span>₹1,50,000</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 text-[10px]">
                    <span className="text-slate-500 block">Allocated</span>
                    <strong className="text-sky-600 font-bold text-xs">₹98,000</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 text-[10px]">
                    <span className="text-slate-500 block">Unallocated</span>
                    <strong className="text-emerald-600 font-bold text-xs">₹52,000</strong>
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 rounded-xl bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm">
                  <PlusCircle size={13} />
                  <span>Add Money</span>
                </div>
                <div
                  className="h-10 rounded-xl border text-xs font-semibold flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  + Add Product
                </div>
              </div>

              {/* Sample Product item in Mobile View */}
              <div
                className="p-3 rounded-xl border flex flex-col gap-1.5"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold" style={{ color: 'var(--text)' }}>Sony WH-1000XM5</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>₹29,990</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-emerald-600 font-bold">
                  <span>100% Fully Funded</span>
                  <span>Ready to buy</span>
                </div>
              </div>

              {/* Simulated Mobile Bottom Navigation Bar */}
              <div
                className="mt-auto pt-2 border-t flex justify-around items-center text-[10px]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <div className="flex flex-col items-center gap-0.5 text-indigo-500 font-bold">
                  <span>📦</span>
                  <span>Products</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 opacity-60">
                  <span>🎯</span>
                  <span>Goals</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 opacity-60">
                  <span>🕒</span>
                  <span>History</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 opacity-60">
                  <span>🛍️</span>
                  <span>Purchased</span>
                </div>
              </div>

              {/* iOS Home Indicator Bar */}
              <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full mx-auto mt-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
