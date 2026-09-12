import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { useModalStore } from '../../store/useModalStore';
import { usePurchaseStore, selectFundSummary } from '../../store/usePurchaseStore';
import { formatCurrency } from '../../utils/currency';
import { distributeByPercentage } from '../../utils/allocation';
import type { AllocationEntry } from '../../types';

type Step = 'configure' | 'preview';

export function RedistributeModal() {
  const { redistributeOpen, closeRedistribute } = useModalStore();
  const store = usePurchaseStore();
  const { products, redistribute } = store;
  const summary = selectFundSummary(store);

  const [step, setStep] = useState<Step>('configure');
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const activeProducts = products.filter((p) => p.status !== 'purchased');
  const totalAllocatedPaise = activeProducts.reduce((s, p) => s + p.allocatedPaise, 0);

  useEffect(() => {
    if (redistributeOpen) {
      setStep('configure');
      // Initialize percentages based on current allocation so they sum to exactly 100.0%
      const initPct: Record<string, string> = {};
      if (totalAllocatedPaise > 0 && activeProducts.length > 0) {
        let runningSum = 0;
        activeProducts.forEach((p, idx) => {
          if (idx === activeProducts.length - 1) {
            const remainder = Math.max(0, 100 - runningSum);
            initPct[p.id] = remainder.toFixed(1);
          } else {
            const pct = Math.round((p.allocatedPaise / totalAllocatedPaise) * 1000) / 10;
            runningSum += pct;
            initPct[p.id] = pct.toFixed(1);
          }
        });
      } else {
        activeProducts.forEach((p) => {
          initPct[p.id] = '';
        });
      }
      setPercentages(initPct);
      setError('');
    }
  }, [redistributeOpen]);

  const percentageTotal = useMemo(() => {
    return activeProducts.reduce((s, p) => s + (parseFloat(percentages[p.id] || '0') || 0), 0);
  }, [activeProducts, percentages]);

  const newAllocations: AllocationEntry[] = useMemo(() => {
    if (Math.abs(percentageTotal - 100) > 0.2 || totalAllocatedPaise === 0) return [];
    // Scale percentages so they sum to exactly 100 internally
    const scale = percentageTotal > 0 ? 100 / percentageTotal : 1;
    const pcts = activeProducts.map((p) => ({
      productId: p.id,
      percent: (parseFloat(percentages[p.id] || '0') || 0) * scale,
    }));
    return distributeByPercentage(totalAllocatedPaise, pcts).map((a) => ({
      productId: a.productId,
      productName: activeProducts.find((p) => p.id === a.productId)?.name ?? '',
      amountPaise: a.amountPaise,
    }));
  }, [activeProducts, percentages, percentageTotal, totalAllocatedPaise]);

  function handleNext() {
    if (Math.abs(percentageTotal - 100) > 0.2) {
      setError(`Percentages must total 100% (within ±0.2%). Current: ${percentageTotal.toFixed(1)}%`);
      return;
    }
    if (totalAllocatedPaise === 0) {
      setError('No allocated money to redistribute');
      return;
    }
    setError('');
    setStep('preview');
  }

  function handleConfirm() {
    redistribute(newAllocations);
    closeRedistribute();
  }

  const inputStyle = {
    backgroundColor: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
  };

  if (activeProducts.length === 0) {
    return (
      <Modal isOpen={redistributeOpen} onClose={closeRedistribute} title="⇄ Redistribute Funds" size="md"
        footer={<button onClick={closeRedistribute} className="px-4 py-2 rounded-lg text-sm"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Close</button>}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active products to redistribute funds among.</p>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={redistributeOpen}
      onClose={closeRedistribute}
      title="⇄ Redistribute Existing Funds"
      size="lg"
      footer={
        <div className="flex w-full justify-end gap-3">
          {step === 'preview' && (
            <button onClick={() => setStep('configure')} className="px-4 py-2 rounded-lg text-sm"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Back
            </button>
          )}
          <button onClick={closeRedistribute} className="px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
          {step === 'configure' ? (
            <button onClick={handleNext}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">
              Preview →
            </button>
          ) : (
            <button onClick={handleConfirm}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">
              Apply Redistribution
            </button>
          )}
        </div>
      }
    >
      {step === 'configure' && (
        <div className="flex flex-col gap-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total allocated funds to redistribute</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(totalAllocatedPaise)}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>New Percentage Allocation</label>
              <span className={`text-xs font-bold ${Math.abs(percentageTotal - 100) <= 0.2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                Total: {percentageTotal.toFixed(1)}% {Math.abs(percentageTotal - 100) <= 0.2 ? '✓' : ''}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {activeProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{p.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Currently: {formatCurrency(p.allocatedPaise)}
                    </p>
                  </div>
                  <div className="relative w-28 flex-shrink-0">
                    <input type="number" value={percentages[p.id] ?? ''}
                      onChange={(e) => setPercentages({ ...percentages, [p.id]: e.target.value })}
                      min="0" max="100" step="0.1" placeholder="0"
                      className="w-full pr-6 pl-3 py-2 rounded-lg text-sm outline-none text-right" style={inputStyle} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>%</span>
                  </div>
                  <span className="text-xs w-24 text-right" style={{ color: 'var(--text-muted)' }}>
                    → {formatCurrency(Math.round(totalAllocatedPaise * (parseFloat(percentages[p.id] || '0') || 0) / 100))}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const each = (100 / activeProducts.length).toFixed(2);
                const newPcts: Record<string, string> = {};
                activeProducts.forEach((p) => { newPcts[p.id] = each; });
                setPercentages(newPcts);
              }}
              className="mt-3 text-xs text-sky-500 hover:text-sky-600 underline"
            >
              Distribute equally
            </button>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>
      )}

      {step === 'preview' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Redistributing {formatCurrency(totalAllocatedPaise)} among {activeProducts.length} products
          </p>

          {/* Comparison table */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-4 px-4 py-2.5 text-xs font-semibold"
                 style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)' }}>
              <span>Product</span>
              <span className="text-right">Current</span>
              <span className="text-right">New</span>
              <span className="text-right">Change</span>
            </div>
            {newAllocations.map((a) => {
              const product = activeProducts.find((p) => p.id === a.productId);
              if (!product) return null;
              const diff = a.amountPaise - product.allocatedPaise;
              return (
                <div key={a.productId}
                     className="grid grid-cols-4 px-4 py-3 border-t text-sm"
                     style={{ borderColor: 'var(--border)' }}>
                  <span className="font-medium truncate" style={{ color: 'var(--text)' }}>{product.name}</span>
                  <span className="text-right" style={{ color: 'var(--text-muted)' }}>{formatCurrency(product.allocatedPaise)}</span>
                  <span className="text-right font-semibold" style={{ color: 'var(--text)' }}>{formatCurrency(a.amountPaise)}</span>
                  <span className={`text-right font-semibold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : ''}`}
                        style={diff === 0 ? { color: 'var(--text-muted)' } : {}}>
                    {diff > 0 ? '+' : ''}{formatCurrency(Math.abs(diff))}
                    {diff === 0 && ' —'}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            ⚠ This will update allocations for all products listed above. The total fund amount stays unchanged.
          </p>
        </div>
      )}
    </Modal>
  );
}
