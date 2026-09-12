import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { useModalStore } from '../../store/useModalStore';
import { usePurchaseStore, selectFundSummary } from '../../store/usePurchaseStore';
import { formatCurrency, rupeesToPaise } from '../../utils/currency';
import { distributeEqually } from '../../utils/allocation';
import type { AllocationEntry } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';

type AmountSource = 'unallocated' | 'new';

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

export function EqualDistributeModal() {
  const { equalDistributeOpen, closeEqualDistribute } = useModalStore();
  const store = usePurchaseStore();
  const { products, addMoney, distributeFromUnallocated } = store;
  const summary = selectFundSummary(store);

  const activeProducts = products
    .filter((p) => p.status !== 'purchased')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [amountSource, setAmountSource] = useState<AmountSource>('unallocated');
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (equalDistributeOpen) {
      setSelectedIds(new Set(activeProducts.map((p) => p.id)));
      setAmountSource('unallocated');
      setCustomAmountStr('');
      setShowPreview(false);
      setError('');
    }
  }, [equalDistributeOpen]);

  const amountToDistributePaise = useMemo(() => {
    if (amountSource === 'unallocated') return summary.unallocatedPaise;
    return rupeesToPaise(parseFloat(customAmountStr) || 0);
  }, [amountSource, customAmountStr, summary.unallocatedPaise]);

  const selectedProducts = activeProducts.filter((p) => selectedIds.has(p.id));

  const allocations: AllocationEntry[] = useMemo(() => {
    if (selectedProducts.length === 0 || amountToDistributePaise <= 0) return [];
    return distributeEqually(amountToDistributePaise, selectedProducts).map((a) => ({
      productId: a.productId,
      productName: selectedProducts.find((p) => p.id === a.productId)?.name ?? '',
      amountPaise: a.amountPaise,
    }));
  }, [selectedProducts, amountToDistributePaise]);

  const perProductPaise =
    selectedProducts.length > 0 ? Math.floor(amountToDistributePaise / selectedProducts.length) : 0;

  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShowPreview(false);
  }

  function toggleAll() {
    setSelectedIds(
      selectedIds.size === activeProducts.length
        ? new Set()
        : new Set(activeProducts.map((p) => p.id))
    );
    setShowPreview(false);
  }

  function handlePreview() {
    if (selectedIds.size === 0) { setError('Select at least one product'); return; }
    if (amountToDistributePaise <= 0) { setError('Amount must be greater than 0'); return; }
    if (amountSource === 'unallocated' && summary.unallocatedPaise <= 0) {
      setError('No unallocated money available. Add money first, or choose "Add New Money".');
      return;
    }
    setError('');
    setShowPreview(true);
  }

  function handleConfirm() {
    if (amountSource === 'unallocated') {
      // Allocate from existing unallocated pool — total fund stays same
      distributeFromUnallocated(allocations);
    } else {
      // Add new money + allocate
      addMoney(amountToDistributePaise, 'equal', allocations, `Equal distribution among ${selectedProducts.length} product(s)`);
    }
    closeEqualDistribute();
  }

  const inputStyle = {
    backgroundColor: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <Modal
      isOpen={equalDistributeOpen}
      onClose={closeEqualDistribute}
      title="= Distribute Equally"
      size="lg"
      footer={
        <div className="flex w-full justify-end gap-3">
          {showPreview && (
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              Back
            </button>
          )}
          <button
            onClick={closeEqualDistribute}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          {!showPreview ? (
            <button
              onClick={handlePreview}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors"
            >
              Preview →
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              ✓ Confirm Distribution
            </button>
          )}
        </div>
      }
    >
      {!showPreview ? (
        <div className="flex flex-col gap-5">
          {/* ── Amount source ── */}
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text)' }}>
              Money Source
            </label>
            <div className="flex flex-col gap-2">
              {/* Unallocated */}
              <label
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${amountSource === 'unallocated' ? 'ring-2 ring-sky-400' : ''}`}
                style={{ backgroundColor: 'var(--surface-2)', border: `1.5px solid ${amountSource === 'unallocated' ? '#38bdf8' : 'var(--border)'}` }}
              >
                <input type="radio" name="amountSource" value="unallocated"
                  checked={amountSource === 'unallocated'}
                  onChange={() => { setAmountSource('unallocated'); setShowPreview(false); }}
                  className="accent-sky-500" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Use Unallocated Funds</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Available:{' '}
                    <strong className={summary.unallocatedPaise > 0 ? 'text-sky-600' : 'text-red-500'}>
                      {formatCurrency(summary.unallocatedPaise)}
                    </strong>
                  </p>
                </div>
              </label>
              {/* New money */}
              <label
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${amountSource === 'new' ? 'ring-2 ring-sky-400' : ''}`}
                style={{ backgroundColor: 'var(--surface-2)', border: `1.5px solid ${amountSource === 'new' ? '#38bdf8' : 'var(--border)'}` }}
              >
                <input type="radio" name="amountSource" value="new"
                  checked={amountSource === 'new'}
                  onChange={() => { setAmountSource('new'); setShowPreview(false); }}
                  className="accent-sky-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Add New Money</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Enter a new amount to add and distribute
                  </p>
                </div>
              </label>
            </div>
            {amountSource === 'new' && (
              <div className="relative mt-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--text-muted)' }}>
                  ₹
                </span>
                <input
                  type="number" value={customAmountStr}
                  onChange={(e) => { setCustomAmountStr(e.target.value); setShowPreview(false); setError(''); }}
                  placeholder="0" min="0" step="0.01"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-2xl font-bold outline-none"
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* ── Product selection ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Select Products{' '}
                <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}>
                  ({selectedIds.size} of {activeProducts.length} selected)
                </span>
              </label>
              <button onClick={toggleAll} className="text-xs text-sky-500 hover:text-sky-600 underline">
                {selectedIds.size === activeProducts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {activeProducts.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
                Add products first to use this feature.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {activeProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  const perShare =
                    isSelected && selectedIds.size > 0 && amountToDistributePaise > 0
                      ? Math.floor(amountToDistributePaise / selectedIds.size)
                      : 0;
                  return (
                    <label
                      key={product.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'ring-1 ring-sky-300' : 'opacity-60'}`}
                      style={{
                        backgroundColor: isSelected ? 'var(--surface-2)' : 'var(--surface-3)',
                        border: `1.5px solid ${isSelected ? '#7dd3fc' : 'var(--border)'}`,
                      }}
                    >
                      <input
                        type="checkbox" checked={isSelected}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 rounded accent-sky-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                              {product.name}
                            </p>
                            <span
                              className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium capitalize"
                              style={{
                                backgroundColor:
                                  product.priority === 'critical' ? '#fee2e2' :
                                  product.priority === 'high'     ? '#ffedd5' :
                                  product.priority === 'medium'   ? '#e0f2fe' : '#f1f5f9',
                                color:
                                  product.priority === 'critical' ? '#b91c1c' :
                                  product.priority === 'high'     ? '#c2410c' :
                                  product.priority === 'medium'   ? '#0369a1' : '#475569',
                              }}
                            >
                              {product.priority}
                            </span>
                          </div>
                          {isSelected && amountToDistributePaise > 0 && (
                            <span className="text-xs font-bold text-sky-600 flex-shrink-0">
                              +{formatCurrency(perShare)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1">
                            <ProgressBar allocatedPaise={product.allocatedPaise} pricePaise={product.pricePaise} height="sm" />
                          </div>
                          <span className="text-xs flex-shrink-0 w-32 text-right" style={{ color: 'var(--text-muted)' }}>
                            {formatCurrency(product.allocatedPaise)} / {formatCurrency(product.pricePaise)}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Live summary ── */}
          {selectedIds.size > 0 && amountToDistributePaise > 0 && (
            <div
              className="p-3 rounded-xl flex items-center justify-between"
              style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(amountToDistributePaise)} ÷ {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''}
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                ≈ {formatCurrency(perProductPaise)} each
              </span>
            </div>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>
      ) : (
        /* ── Preview ── */
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
            <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text)' }}>
              Distribution Preview
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatCurrency(amountToDistributePaise)} distributed equally among {selectedProducts.length} product
              {selectedProducts.length !== 1 ? 's' : ''} ·{' '}
              {amountSource === 'unallocated' ? 'from existing unallocated funds' : 'new money added'}
            </p>
          </div>

          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {allocations.map((a) => {
              const product = activeProducts.find((p) => p.id === a.productId);
              if (!product) return null;
              const newAllocated = product.allocatedPaise + a.amountPaise;
              const willOverfund = newAllocated > product.pricePaise;
              return (
                <div
                  key={a.productId}
                  className="px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {product.name}
                    </span>
                    <span className="text-sm font-bold text-sky-600">+{formatCurrency(a.amountPaise)}</span>
                  </div>
                  <ProgressBar allocatedPaise={newAllocated} pricePaise={product.pricePaise} height="sm" />
                  <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>
                      {formatCurrency(product.allocatedPaise)} → <strong>{formatCurrency(newAllocated)}</strong>
                    </span>
                    {willOverfund && <span className="text-amber-600">⚠ Will overfund</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="p-3 rounded-xl grid grid-cols-3 gap-3"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
              <p className="text-base font-bold text-sky-600">{formatCurrency(amountToDistributePaise)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Products</p>
              <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{selectedProducts.length}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Per Product</p>
              <p className="text-base font-bold" style={{ color: 'var(--text)' }}>
                {formatCurrency(perProductPaise)}
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
