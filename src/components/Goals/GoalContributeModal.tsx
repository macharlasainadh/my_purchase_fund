import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useModalStore } from '../../store/useModalStore';
import { usePurchaseStore, selectFundSummary } from '../../store/usePurchaseStore';
import { formatCurrency, rupeesToPaise } from '../../utils/currency';

export function GoalContributeModal() {
  const { goalContributeOpen, goalContributeTarget, closeGoalContribute } = useModalStore();
  const store = usePurchaseStore();
  const { contributeToGoal, withdrawFromGoal } = store;
  const summary = selectFundSummary(store);

  const [mode, setMode] = useState<'contribute' | 'withdraw'>('contribute');
  const [amountStr, setAmountStr] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const goal = goalContributeTarget;
  const amountPaise = rupeesToPaise(parseFloat(amountStr) || 0);

  useEffect(() => {
    if (goalContributeOpen) {
      setMode('contribute');
      setAmountStr('');
      setNotes('');
      setError('');
    }
  }, [goalContributeOpen]);

  function handleConfirm() {
    if (amountPaise <= 0) { setError('Enter a valid amount'); return; }
    if (mode === 'contribute') {
      // Money comes from the unallocated fund pool
      if (amountPaise > summary.unallocatedPaise) {
        setError(`Only ${formatCurrency(summary.unallocatedPaise)} available (unallocated)`);
        return;
      }
      contributeToGoal(goal!.id, amountPaise, notes || undefined);
    } else {
      if (amountPaise > goal!.savedAmountPaise) {
        setError(`Only ${formatCurrency(goal!.savedAmountPaise)} saved in this goal`);
        return;
      }
      withdrawFromGoal(goal!.id, amountPaise, notes || undefined);
    }
    closeGoalContribute();
  }

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmountPaise - goal.savedAmountPaise);
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <Modal
      isOpen={goalContributeOpen}
      onClose={closeGoalContribute}
      title={mode === 'contribute' ? '💰 Contribute to Goal' : '↩ Withdraw from Goal'}
      size="sm"
      footer={
        <>
          <button onClick={closeGoalContribute} className="px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: goal.color }}>
            {mode === 'contribute' ? 'Contribute' : 'Withdraw'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Goal summary */}
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${goal.color}20`, border: `1.5px solid ${goal.color}40` }}>
          <p className="font-semibold text-sm" style={{ color: goal.color }}>{goal.name}</p>
          <div className="flex gap-4 mt-1">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saved</p>
              <p className="text-sm font-bold" style={{ color: goal.color }}>{formatCurrency(goal.savedAmountPaise)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(goal.targetAmountPaise)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Remaining</p>
              <p className="text-sm font-bold text-rose-500">{formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--border)' }}>
          {(['contribute', 'withdraw'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setAmountStr(''); setError(''); }}
              className="flex-1 py-2 text-sm font-medium transition-colors capitalize"
              style={{
                backgroundColor: mode === m ? goal.color : 'var(--surface-2)',
                color: mode === m ? '#fff' : 'var(--text-muted)',
              }}>
              {m === 'contribute' ? '↑ Contribute' : '↓ Withdraw'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text)' }}>
            Amount (₹)
          </label>
          {mode === 'contribute' && (
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Unallocated available: <strong style={{ color: 'var(--accent-free)' }}>{formatCurrency(summary.unallocatedPaise)}</strong>
            </p>
          )}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: 'var(--text-muted)' }}>₹</span>
            <input type="number" value={amountStr}
              onChange={(e) => { setAmountStr(e.target.value); setError(''); }}
              placeholder="0" min="0" step="0.01"
              className="w-full pl-9 pr-4 py-3 rounded-xl text-xl font-bold outline-none" style={inputStyle} />
          </div>
          {mode === 'contribute' && remaining > 0 && (
            <button onClick={() => setAmountStr(String(remaining / 100))}
              className="mt-1 text-xs underline" style={{ color: goal.color }}>
              Fill remaining ({formatCurrency(remaining)})
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--text)' }}>Notes (optional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional note…"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
        </div>

        {error && <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
      </div>
    </Modal>
  );
}
