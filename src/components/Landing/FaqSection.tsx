import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Where is my financial data stored?',
      a: 'Your data is stored locally in your browser on your device. No account or cloud database is required.',
    },
    {
      q: 'Can I use My Purchase Fund on another device?',
      a: 'Yes. Export your data from your current device and import the backup on your new device to continue where you left off.',
    },
    {
      q: 'Can I back up my data?',
      a: "Yes. You can export your purchase data and restore it later using the application's import functionality.",
    },
    {
      q: 'How does fund allocation work?',
      a: 'When you add money to your fund, you can decide exactly where it goes using 5 allocation methods: allocate to a single priority item, distribute equally among all active products, allocate by custom percentage weights, specify custom amounts per item, or hold it in your unallocated cash pool to assign later.',
    },
    {
      q: 'Can I move money between products after allocating?',
      a: 'Yes. The Move Money tool allows transferring funds directly from one product to another at any time, complete with quick transfer chips (+500, +1k, Max) and real-time before/after balance previews.',
    },
    {
      q: 'Do I need an account or subscription?',
      a: 'No account, sign-up, or subscription is required. My Purchase Fund is completely free, runs locally in your browser, and requires zero external credentials.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
            Clear Answers
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--text-muted)' }}>
            Everything you need to know about how My Purchase Fund works.
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border transition-colors overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: isOpen ? 'var(--accent-fund)' : 'var(--border)',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base" style={{ color: 'var(--text)' }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    className="px-5 sm:px-6 pb-4.5 pt-1 text-sm leading-relaxed border-t animate-in fade-in duration-150"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
