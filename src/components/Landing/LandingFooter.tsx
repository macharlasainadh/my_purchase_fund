import React from 'react';
import { Wallet, ArrowUp } from 'lucide-react';

interface LandingFooterProps {
  onOpenApp: () => void;
}

export function LandingFooter({ onOpenApp }: LandingFooterProps) {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <footer className="border-t py-12" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={scrollToTop}>
              <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-sm">
                <Wallet size={16} />
              </div>
              <span className="text-base font-bold" style={{ color: 'var(--text)' }}>
                My Purchase Fund
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-muted)' }}>
              Organize what you want to buy, decide where your money goes, and track your progress until you're ready to purchase.
            </p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Local-first. Private by design. Portable when you need it.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text)' }}>
              Product
            </p>
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, '#how-it-works')}
              className="hover:text-indigo-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              How It Works
            </a>
            <a
              href="#allocation"
              onClick={(e) => handleAnchorClick(e, '#allocation')}
              className="hover:text-indigo-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Allocation Engine
            </a>
            <a
              href="#products"
              onClick={(e) => handleAnchorClick(e, '#products')}
              className="hover:text-indigo-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Product Planning
            </a>
            <a
              href="#goals"
              onClick={(e) => handleAnchorClick(e, '#goals')}
              className="hover:text-indigo-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Long-term Goals
            </a>
            <a
              href="#faq"
              onClick={(e) => handleAnchorClick(e, '#faq')}
              className="hover:text-indigo-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              FAQ
            </a>
          </div>

          {/* Application Launch */}
          <div className="flex flex-col gap-3 text-xs sm:text-sm">
            <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text)' }}>
              Quick Launch
            </p>
            <button
              onClick={onOpenApp}
              className="h-10 px-4 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors text-left flex items-center justify-between shadow-sm cursor-pointer"
            >
              <span>Open Application</span>
              <span>→</span>
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl border flex items-center justify-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
            >
              <ArrowUp size={13} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-subtle)' }}
        >
          <p>© {new Date().getFullYear()} My Purchase Fund. Built for intentional spending.</p>
          <p>Progressive Web App · Works Offline</p>
        </div>
      </div>
    </footer>
  );
}
