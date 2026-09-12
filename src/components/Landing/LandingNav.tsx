import React, { useState, useEffect } from 'react';
import { Wallet, Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import { usePurchaseStore } from '../../store/usePurchaseStore';

interface LandingNavProps {
  onOpenApp: () => void;
}

export function LandingNav({ onOpenApp }: LandingNavProps) {
  const { darkMode, setDarkMode } = usePurchaseStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Allocation Engine', href: '#allocation' },
    { label: 'Product Planning', href: '#products' },
    { label: 'Goals', href: '#goals' },
    { label: 'FAQ', href: '#faq' },
  ];

  function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 shadow-sm backdrop-blur-xl border-b'
          : 'py-4 bg-transparent'
      }`}
      style={{
        backgroundColor: scrolled
          ? darkMode
            ? 'rgba(15, 23, 42, 0.92)'
            : 'rgba(255, 255, 255, 0.92)'
          : 'transparent',
        borderColor: scrolled ? 'var(--border)' : 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/25">
            <Wallet size={19} className="text-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight leading-none block" style={{ color: 'var(--text)' }}>
              My Purchase Fund
            </span>
            <span className="text-[11px] font-medium leading-none block mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Personal purchase planner
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-sm font-medium transition-colors hover:text-indigo-500 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-95"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Primary CTA button */}
          <button
            onClick={onOpenApp}
            className="hidden sm:flex items-center gap-2 h-10 px-4.5 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <span>Open App</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b px-5 py-4 shadow-xl flex flex-col gap-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="py-2 text-sm font-medium transition-colors"
              style={{ color: 'var(--text)' }}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApp();
              }}
              className="w-full h-11 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
            >
              <span>Open App</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
