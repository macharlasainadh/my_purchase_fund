import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FinalCtaSectionProps {
  onOpenApp: () => void;
}

export function FinalCtaSection({ onOpenApp }: FinalCtaSectionProps) {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden border-t" style={{ borderColor: 'var(--border)' }}>
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-3xl opacity-20 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, #a855f7 40%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-500 border mb-6"
          style={{
            backgroundColor: 'var(--accent-fund-bg)',
            borderColor: 'color-mix(in srgb, var(--accent-fund) 25%, transparent)',
          }}
        >
          <Sparkles size={13} />
          <span>Start In Seconds</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-5 text-balance" style={{ color: 'var(--text)' }}>
          Your next purchase doesn't need to be impulsive.{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Give it a plan.
          </span>
        </h2>

        <p className="text-base sm:text-lg max-w-xl mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Join disciplined planners who save deliberately and buy guilt-free. No account setup required.
        </p>

        <button
          onClick={onOpenApp}
          className="h-14 px-9 rounded-2xl text-base font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-500/25 cursor-pointer"
        >
          <span>Start Planning — Open App</span>
          <ArrowRight size={18} />
        </button>

        <p className="text-xs mt-4 font-medium" style={{ color: 'var(--text-muted)' }}>
          Free · 100% Private & Local-First · No Sign-Up
        </p>
      </div>
    </section>
  );
}
