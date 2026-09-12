import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { usePurchaseStore, selectFundSummary } from '../../store/usePurchaseStore';
import { useModalStore } from '../../store/useModalStore';
import { formatCurrency, rupeesToPaise, paiseToRupees } from '../../utils/currency';
import type { Product } from '../../types';

interface PurchaseModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  product?: Product | null;
}

export function PurchaseModal(props?: PurchaseModalProps) {
  const modalStore = useModalStore();
  const isOpen = props?.isOpen ?? modalStore.purchaseModalOpen;
  const onClose = props?.onClose ?? modalStore.closePurchaseModal;
  const product = props?.product ?? modalStore.purchaseModalProduct;

  const store = usePurchaseStore();
  const summary = selectFundSummary(store);
  const { markAsPurchased } = store;
  const [finalPriceStr, setFinalPriceStr] = useState('');
  const [notes, setNotes] = useState('');
  const [excessAction, setExcessAction] = useState<'keep' | 'unallocated'>('unallocated');
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFinalPriceStr(String(paiseToRupees(product.pricePaise)));
      setNotes('');
      setExcessAction('unallocated');
      setError('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const finalPricePaise = rupeesToPaise(parseFloat(finalPriceStr) || 0);
  const excessPaise = Math.max(0, product.allocatedPaise - finalPricePaise);

  function handleConfirm() {
    if (!product) return;
    if (finalPricePaise <= 0) { setError('Enter a valid purchase price'); return; }
    const maxAffordablePaise = product.allocatedPaise + summary.unallocatedPaise;
    if (finalPricePaise > maxAffordablePaise) {
      setError(
        `Purchase price exceeds product allocation plus available unallocated fund (max: ${formatCurrency(maxAffordablePaise)})`
      );
      return;
    }
    markAsPurchased(product.id, finalPricePaise, excessAction, notes);
    onClose();
  }

  const inputStyle = {
    backgroundColor: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🛒 Mark as Purchased"
      size="md"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm cursor-pointer"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer">
            Mark Purchased
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Product summary */}
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{product.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Allocated: {formatCurrency(product.allocatedPaise)} · Estimated: {formatCurrency(product.pricePaise)}
          </p>
        </div>

        {/* Final Price */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text)' }}>
            Actual Purchase Price (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>₹</span>
            <input
              type="number"
              value={finalPriceStr}
              onChange={(e) => { setFinalPriceStr(e.target.value); setError(''); }}
              placeholder="0"
              min="0"
              step="0.01"
              autoFocus
              className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Excess allocation handling */}
        {excessPaise > 0 && (
          <div className="p-3 rounded-xl flex flex-col gap-2"
               style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold text-emerald-600">
              🎉 You saved {formatCurrency(excessPaise)}!
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              What would you like to do with the excess allocated money?
            </p>
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text)' }}>
                <input
                  type="radio"
                  name="excess"
                  value="unallocated"
                  checked={excessAction === 'unallocated'}
                  onChange={() => setExcessAction('unallocated')}
                  className="accent-sky-500"
                />
                Return {formatCurrency(excessPaise)} to unallocated fund
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text)' }}>
                <input
                  type="radio"
                  name="excess"
                  value="keep"
                  checked={excessAction === 'keep'}
                  onChange={() => setExcessAction('keep')}
                  className="accent-sky-500"
                />
                Remove full allocated amount from fund
              </label>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text)' }}>
            Purchase Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Bought on Amazon sale, warranty included..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
            style={inputStyle}
          />
        </div>
      </div>
    </Modal>
  );
}
