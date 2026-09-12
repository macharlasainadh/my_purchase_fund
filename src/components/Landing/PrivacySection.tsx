import React from 'react';
import { ShieldCheck, HardDrive, Download, Upload, FileSpreadsheet, Lock } from 'lucide-react';

export function PrivacySection() {
  return (
    <section className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl border p-8 sm:p-12 shadow-xl relative overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Subtle decorative glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none -z-10"
            style={{ backgroundColor: '#6366f1' }}
          />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-500 border mb-4"
                style={{
                  backgroundColor: 'var(--accent-fund-bg)',
                  borderColor: 'color-mix(in srgb, var(--accent-fund) 25%, transparent)',
                }}
              >
                <ShieldCheck size={13} />
                <span>Data Sovereignty & Privacy</span>
              </div>

              {/* Exact user requested positioning */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--text)' }}>
                Local-first. Private by design. Portable when you need it.
              </h2>

              <p className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                Private, local-first storage with easy data backup and transfer.
              </p>

              {/* Exact user requested explanation */}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Your data is stored locally in your browser. Export your data as a backup file and import it on another device whenever you want to continue your purchase plans.
              </p>
            </div>

            {/* Feature Chips Box */}
            <div className="w-full lg:w-auto flex flex-col gap-3 min-w-[260px]">
              <div
                className="p-3.5 rounded-2xl border flex items-center gap-3"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Lock size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold" style={{ color: 'var(--text)' }}>Zero Cloud Accounts</p>
                  <p style={{ color: 'var(--text-muted)' }}>No passwords, no tracking, no servers</p>
                </div>
              </div>

              <div
                className="p-3.5 rounded-2xl border flex items-center gap-3"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Download size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold" style={{ color: 'var(--text)' }}>One-Click JSON Backup</p>
                  <p style={{ color: 'var(--text-muted)' }}>Export full snapshots to file</p>
                </div>
              </div>

              <div
                className="p-3.5 rounded-2xl border flex items-center gap-3"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet size={16} />
                </div>
                <div className="text-xs">
                  <p className="font-bold" style={{ color: 'var(--text)' }}>CSV Spreadsheet Export</p>
                  <p style={{ color: 'var(--text-muted)' }}>Products & transactions in Excel/Sheets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
