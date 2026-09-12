import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useModalStore } from '../../store/useModalStore';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { formatCurrency, rupeesToPaise, paiseToRupees } from '../../utils/currency';

export function MoveMoneyModal() {
  const { moveMoneyOpen, moveMoneySourceProduct, closeMoveMoney } = useModalStore();
  const { products, moveMoney } = usePurchaseStore();

  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState('');

  const activeProducts = products.filter((p) => p.status !== 'purchased');
  const productsWithMoney = activeProducts.filter((p) => p.allocatedPaise > 0);
  const canMove = activeProducts.length >= 2 && productsWithMoney.length > 0;

  useEffect(() => {
    if (moveMoneyOpen) {
      if (moveMoneySourceProduct && moveMoneySourceProduct.allocatedPaise > 0) {
        setFromId(moveMoneySourceProduct.id);
        setToId('');
      } else if (moveMoneySourceProduct && moveMoneySourceProduct.allocatedPaise === 0) {
        setFromId(productsWithMoney[0]?.id ?? '');
        setToId(moveMoneySourceProduct.id);
      } else {
        setFromId(productsWithMoney[0]?.id ?? '');
        setToId('');
      }
      setAmountStr('');
      setError('');
    }
  }, [moveMoneyOpen, moveMoneySourceProduct]);

  const fromProduct = activeProducts.find((p) => p.id === fromId);
  const toProduct = activeProducts.find((p) => p.id === toId);
  const amountPaise = rupeesToPaise(parseFloat(amountStr) || 0);

  function handleConfirm() {
    if (!fromId || !toId) { setError('Select both source and destination products'); return; }
    if (fromId === toId) { setError('Source and destination must be different'); return; }
    if (amountPaise <= 0) { setError('Enter a valid amount'); return; }
    if (!fromProduct || amountPaise > fromProduct.allocatedPaise) {
      setError(`Cannot move more than ${formatCurrency(fromProduct?.allocatedPaise ?? 0)} (current allocation)`);
      return;
    }
    moveMoney(fromId, toId, amountPaise);
    closeMoveMoney();
  }

  const inputStyle = {
    backgroundColor: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <Modal
      isOpen={moveMoneyOpen}
      onClose={closeMoveMoney}
      title="↔ Move Money Between Products"
      size="md"
      footer={
        <>
          <button onClick={closeMoveMoney}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            {canMove ? 'Cancel' : 'Close'}
          </button>
          {canMove && (
            <button onClick={handleConfirm}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors cursor-pointer">
              Move Money
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {activeProducts.length < 2 ? (
          <p className="text-sm text-amber-600 bg-amber-50 px-3 py-3 rounded-xl">
            You need at least 2 active products to move money between them.
          </p>
        ) : productsWithMoney.length === 0 ? (
          <p className="text-sm text-amber-600 bg-amber-50 px-3 py-3 rounded-xl">
            No products currently have allocated money to move. Add or allocate money to a product first.
          </p>
        ) : (
          <>
            {/* From */}
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text)' }}>Move From</label>
              <select value={fromId} onChange={(e) => setFromId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                <option value="">Select source product</option>
                {productsWithMoney.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.allocatedPaise)} available
                  </option>
                ))}
              </select>
              {fromProduct && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Available: {formatCurrency(fromProduct.allocatedPaise)}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="p-2 rounded-full bg-sky-50">
                <ArrowRight size={18} className="text-sky-500" />
              </div>
            </div>

            {/* To */}
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text)' }}>Move To</label>
              <select value={toId} onChange={(e) => setToId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                <option value="">Select destination product</option>
                {activeProducts.filter((p) => p.id !== fromId).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — currently {formatCurrency(p.allocatedPaise)} / {formatCurrency(p.pricePaise)}
                  </option>
                ))}
              </select>
              {toProduct && amountPaise > 0 && (() => {
                const newAlloc = toProduct.allocatedPaise + amountPaise;
                const willOver = newAlloc > toProduct.pricePaise;
                return (
                  <p className={`text-xs mt-1 ${willOver ? 'text-amber-600' : ''}`} style={!willOver ? { color: 'var(--text-muted)' } : {}}>
                    After: {formatCurrency(newAlloc)} / {formatCurrency(toProduct.pricePaise)}
                    {willOver && ' ⚠ Will overfund'}
                  </p>
                );
              })()}
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text)' }}>Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: 'var(--text-muted)' }}>₹</span>
                <input type="number" value={amountStr} onChange={(e) => { setAmountStr(e.target.value); setError(''); }}
                  placeholder="0" min="0" step="0.01"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-xl font-bold outline-none" style={inputStyle} />
              </div>
              
              {/* Quick amount chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[500, 1000, 2000, 5000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(amountStr) || 0;
                      const max = fromProduct ? paiseToRupees(fromProduct.allocatedPaise) : Infinity;
                      setAmountStr(String(Math.min(max, cur + chip)));
                      setError('');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] active:scale-95 transition-all cursor-pointer"
                  >
                    +{chip >= 1000 ? `${chip / 1000}k` : chip}
                  </button>
                ))}
                {fromProduct && fromProduct.allocatedPaise > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAmountStr(String(paiseToRupees(fromProduct.allocatedPaise)));
                      setError('');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-sky-300 text-sky-600 bg-sky-50 dark:bg-sky-950/40 active:scale-95 transition-all cursor-pointer"
                  >
                    Max ({formatCurrency(fromProduct.allocatedPaise)})
                  </button>
                )}
              </div>
            </div>

            {/* Summary */}
            {fromProduct && toProduct && amountPaise > 0 && amountPaise <= fromProduct.allocatedPaise && (
              <div className="p-3.5 rounded-xl border border-[var(--border)]" style={{ backgroundColor: 'var(--surface-2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Transfer Preview</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <p className="text-xs font-medium text-[var(--text-muted)] truncate">{fromProduct.name}</p>
                    <p className="text-xs mt-1 text-[var(--text-muted)]">
                      Current: <span className="font-semibold text-[var(--text)]">{formatCurrency(fromProduct.allocatedPaise)}</span>
                    </p>
                    <p className="text-sm font-bold text-red-500 mt-0.5">
                      New: {formatCurrency(fromProduct.allocatedPaise - amountPaise)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <p className="text-xs font-medium text-[var(--text-muted)] truncate">{toProduct.name}</p>
                    <p className="text-xs mt-1 text-[var(--text-muted)]">
                      Current: <span className="font-semibold text-[var(--text)]">{formatCurrency(toProduct.allocatedPaise)}</span>
                    </p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                      New: {formatCurrency(toProduct.allocatedPaise + amountPaise)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          </>
        )}
      </div>
    </Modal>
  );
}
