import React, { useRef, useState } from 'react';
import { Download, Upload, FileText, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useModalStore } from '../../store/useModalStore';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { formatCurrency, paiseToRupees } from '../../utils/currency';
import { sanitizeBackupData } from '../../utils/sanitizeBackup';

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  let s = String(val ?? '');
  // Neutralize CSV Formula Injection (DDE) triggers for Excel / Sheets
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function isoDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataManagementModal() {
  const { dataManagementOpen, closeDataManagement } = useModalStore();
  const store = usePurchaseStore();
  const { products, goals, purchasedProducts, transactions, totalFundPaise, restoreFromBackup } = store;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreMsg, setRestoreMsg] = useState('');

  // ── Export JSON ─────────────────────────────────────────────────────────────
  function handleExportJson() {
    const data = {
      _version: 1,
      _exportedAt: new Date().toISOString(),
      _appName: 'My Purchase Fund',
      totalFundPaise,
      products,
      purchasedProducts,
      goals,
      transactions,
    };
    const json = JSON.stringify(data, null, 2);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(json, `my-purchase-fund-backup-${date}.json`, 'application/json');
  }

  // ── Import JSON ─────────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const sanitized = sanitizeBackupData(raw);
        restoreFromBackup(sanitized);
        setRestoreStatus('success');
        setRestoreMsg(`Restored: ${sanitized.products.length} products, ${sanitized.goals.length} goals, ${sanitized.transactions.length} transactions.`);
      } catch (err) {
        setRestoreStatus('error');
        setRestoreMsg(err instanceof Error ? err.message : 'Failed to parse backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ── Export Products CSV ─────────────────────────────────────────────────────
  function handleExportProductsCsv() {
    const header = ['Name', 'Category', 'Price (₹)', 'Allocated (₹)', 'Remaining (₹)', 'Priority', 'Status', 'Funded %', 'Target Date', 'Notes', 'Links'];
    const rows = products.map((p) => [
      p.name,
      p.category,
      paiseToRupees(p.pricePaise).toFixed(2),
      paiseToRupees(p.allocatedPaise).toFixed(2),
      paiseToRupees(Math.max(0, p.pricePaise - p.allocatedPaise)).toFixed(2),
      p.priority,
      p.status,
      p.pricePaise ? ((p.allocatedPaise / p.pricePaise) * 100).toFixed(1) + '%' : '0%',
      p.targetDate ?? '',
      p.notes ?? '',
      p.links.map((l) => l.url).join(' | '),
    ]);
    const csv = [header, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `mpf-products-${date}.csv`, 'text/csv');
  }

  // ── Export Transactions CSV ─────────────────────────────────────────────────
  function handleExportTransactionsCsv() {
    const header = ['Date', 'Type', 'Amount (₹)', 'Description', 'Notes'];
    const rows = transactions.map((t) => [
      isoDate(t.date),
      t.type,
      paiseToRupees(t.amountPaise).toFixed(2),
      t.description,
      t.notes ?? '',
    ]);
    const csv = [header, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `mpf-transactions-${date}.csv`, 'text/csv');
  }

  const btnBase = 'flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-colors';
  const inputStyle: React.CSSProperties = { backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <Modal
      isOpen={dataManagementOpen}
      onClose={closeDataManagement}
      title="💾 Data Management"
      size="sm"
    >
      <div className="flex flex-col gap-3">

        {/* Snapshot */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
          <div className="flex items-center gap-2">
            <Database size={15} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {products.length} products · {goals.length} goals · {transactions.length} transactions
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--accent-fund)' }}>
            {formatCurrency(totalFundPaise)}
          </span>
        </div>

        {/* Divider */}
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Backup & Restore</p>

        {/* Export JSON */}
        <button
          onClick={handleExportJson}
          className={btnBase}
          style={{ backgroundColor: 'var(--accent-fund-bg)', color: 'var(--accent-fund)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-fund) 20%, transparent)' }}>
            <Download size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold">Download Backup (JSON)</p>
            <p className="text-xs opacity-70">Full data — products, goals, transactions</p>
          </div>
        </button>

        {/* Import JSON */}
        <button
          onClick={() => { setRestoreStatus('idle'); fileInputRef.current?.click(); }}
          className={btnBase}
          style={{ backgroundColor: 'var(--accent-allocated-bg)', color: 'var(--accent-allocated)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-allocated) 20%, transparent)' }}>
            <Upload size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold">Restore from Backup</p>
            <p className="text-xs opacity-70">Upload a .json backup file to restore</p>
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

        {/* Restore status */}
        {restoreStatus !== 'idle' && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-sm"
            style={{
              backgroundColor: restoreStatus === 'success' ? 'var(--accent-free-bg)' : 'var(--accent-needed-bg)',
              color: restoreStatus === 'success' ? 'var(--accent-free)' : 'var(--accent-needed)',
            }}
          >
            {restoreStatus === 'success'
              ? <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />
              : <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            }
            <span>{restoreMsg}</span>
          </div>
        )}

        {/* Divider */}
        <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>Export as Spreadsheet</p>

        {/* Export Products CSV */}
        <button
          onClick={handleExportProductsCsv}
          className={btnBase}
          style={{ backgroundColor: 'var(--accent-free-bg)', color: 'var(--accent-free)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-free) 20%, transparent)' }}>
            <FileText size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold">Export Products (CSV)</p>
            <p className="text-xs opacity-70">Name, price, allocation, status, links</p>
          </div>
        </button>

        {/* Export Transactions CSV */}
        <button
          onClick={handleExportTransactionsCsv}
          className={btnBase}
          style={{ backgroundColor: 'var(--accent-required-bg)', color: 'var(--accent-required)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-required) 20%, transparent)' }}>
            <FileText size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold">Export Transactions (CSV)</p>
            <p className="text-xs opacity-70">Full history — date, type, amount</p>
          </div>
        </button>

      </div>
    </Modal>
  );
}
