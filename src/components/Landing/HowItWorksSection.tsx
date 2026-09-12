import React from 'react';
import { Package, PlusCircle, PieChart, ShoppingCart, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Plan What You Want to Buy',
      desc: 'Create product cards with estimated prices, target purchase dates, priority rankings (Critical to Low), notes, and direct store links.',
      icon: <Package size={22} className="text-indigo-500" />,
      color: 'var(--accent-fund)',
      bg: 'var(--accent-fund-bg)',
      highlight: 'Set price & priority',
    },
    {
      num: '02',
      title: 'Deposit Into Your Fund',
      desc: 'Whenever you save money, add it to your Total Fund using quick chip amounts (+₹1k, +₹5k, etc.) or custom amounts.',
      icon: <PlusCircle size={22} className="text-sky-500" />,
      color: 'var(--accent-allocated)',
      bg: 'var(--accent-allocated-bg)',
      highlight: 'Add money anytime',
    },
    {
      num: '03',
      title: 'Allocate With Purpose',
      desc: 'Choose how your money is divided: fund a single priority item, distribute equally, split by percentage, or keep it free in unallocated cash.',
      icon: <PieChart size={22} className="text-purple-500" />,
      color: 'var(--accent-progress)',
      bg: 'var(--accent-progress-bg)',
      highlight: '5 allocation methods',
    },
    {
      num: '04',
      title: 'Track, Purchase & Save',
      desc: 'Watch real-time progress bars reach 100%. When funded, mark as purchased, record the final price paid, and return any savings to your fund.',
      icon: <ShoppingCart size={22} className="text-emerald-500" />,
      color: 'var(--accent-free)',
      bg: 'var(--accent-free-bg)',
      highlight: 'Guilt-free buying',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
            Simple 4-Step Journey
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            How My Purchase Fund Works
          </h2>
          <p className="text-sm sm:text-base mt-3" style={{ color: 'var(--text-muted)' }}>
            A disciplined, transparent framework to take you from a wishlist idea to a fully funded purchase.
          </p>
        </div>

        {/* 4 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="rounded-3xl p-6 border flex flex-col justify-between relative transition-transform hover:-translate-y-1 hover:shadow-md"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                    style={{ backgroundColor: step.bg, color: step.color }}
                  >
                    {step.num}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: step.bg }}
                  >
                    {step.icon}
                  </div>
                </div>

                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text)' }}>
                  {step.title}
                </h3>

                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[11px] font-semibold" style={{ color: step.color }}>
                  {step.highlight}
                </span>
                {idx < 3 && (
                  <ArrowRight size={14} className="hidden lg:block text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
