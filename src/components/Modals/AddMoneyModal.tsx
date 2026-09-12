import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, X, Check, PlusCircle, AlertCircle, Wallet, ShoppingCart, Layers, Database } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useModalStore } from '../../store/useModalStore';
import { usePurchaseStore, selectFundSummary } from '../../store/usePurchaseStore';
import { rupeesToPaise, formatCurrency, paiseToRupees } from '../../utils/currency';
import { distributeEqually, distributeByPercentage } from '../../utils/allocation';
import type { AllocationMethod, AllocationEntry } from '../../types';

type Step = 'amount' | 'method' | 'configure' | 'preview';

const METHOD_INFO: { id: AllocationMethod; label: string; desc: string }[] = [
  { id: 'unallocated', label: 'Keep Unallocated', desc: 'Add to fund, assign later' },
  { id: 'single', label: 'Allocate to One Product', desc: 'Direct to a specific product' },
  { id: 'equal', label: 'Distribute Equally', desc: 'Split evenly among all products' },
  { id: 'percentage', label: 'Allocate by Percentage', desc: 'Assign % to each product' },
  { id: 'custom', label: 'Custom Allocation', desc: 'Specify exact amounts manually' },
];

const stepNames: Record<Step, { label: string; stepNumber: number }> = {
  amount: { label: 'Enter Amount', stepNumber: 1 },
  method: { label: 'Choose Method', stepNumber: 2 },
  configure: { label: 'Configure Allocation', stepNumber: 3 },
  preview: { label: 'Review & Confirm', stepNumber: 4 },
};

export function AddMoneyModal() {
  const { addMoneyOpen, addMoneyTargetProduct, closeAddMoney } = useModalStore();
  const store = usePurchaseStore();
  const { products, addMoney } = store;
  const summary = selectFundSummary(store);

  const [step, setStep] = useState<Step>('amount');
  const [amountStr, setAmountStr] = useState('');
  const [method, setMethod] = useState<AllocationMethod>('unallocated');
  const [singleProductId, setSingleProductId] = useState('');
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string>('');

  const amountPaise = rupeesToPaise(parseFloat(amountStr) || 0);
  const activeProducts = products.filter((p) => p.status !== 'purchased');

  useEffect(() => {
    if (addMoneyOpen) {
      setStep('amount');
      setAmountStr('');
      setMethod(addMoneyTargetProduct ? 'single' : 'unallocated');
      setSingleProductId(addMoneyTargetProduct?.id ?? (activeProducts[0]?.id ?? ''));
      const initPct: Record<string, string> = {};
      const initAmt: Record<string, string> = {};
      activeProducts.forEach((p) => { initPct[p.id] = ''; initAmt[p.id] = ''; });
      setPercentages(initPct);
      setCustomAmounts(initAmt);
      setErrors('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [addMoneyOpen, addMoneyTargetProduct]);

  // ── Derived calculations ──────────────────────────────────────────────────

  const equalAllocations = useMemo(() => {
    if (method !== 'equal' || amountPaise === 0 || activeProducts.length === 0) return [];
    return distributeEqually(amountPaise, activeProducts);
  }, [method, amountPaise, activeProducts]);

  const percentageAllocations = useMemo(() => {
    if (method !== 'percentage' || amountPaise === 0) return [];
    const pcts = activeProducts.map((p) => ({
      productId: p.id,
      percent: parseFloat(percentages[p.id] || '0') || 0,
    }));
    const total = pcts.reduce((s, p) => s + p.percent, 0);
    if (Math.abs(total - 100) > 0.2) return [];
    return distributeByPercentage(amountPaise, pcts);
  }, [method, amountPaise, activeProducts, percentages]);

  const customTotal = useMemo(() => {
    return activeProducts.reduce((s, p) => s + rupeesToPaise(parseFloat(customAmounts[p.id] || '0') || 0), 0);
  }, [activeProducts, customAmounts]);

  const percentageTotal = useMemo(() => {
    return activeProducts.reduce((s, p) => s + (parseFloat(percentages[p.id] || '0') || 0), 0);
  }, [activeProducts, percentages]);

  // ── Preview calculations ──────────────────────────────────────────────────

  const previewAllocations: AllocationEntry[] = useMemo(() => {
    switch (method) {
      case 'unallocated': return [];
      case 'single': {
        const p = activeProducts.find((p) => p.id === singleProductId);
        if (!p) return [];
        return [{ productId: p.id, productName: p.name, amountPaise }];
      }
      case 'equal':
        return equalAllocations.map((a) => ({
          productId: a.productId,
          productName: activeProducts.find((p) => p.id === a.productId)?.name ?? '',
          amountPaise: a.amountPaise,
        }));
      case 'percentage':
        return percentageAllocations.map((a) => ({
          productId: a.productId,
          productName: activeProducts.find((p) => p.id === a.productId)?.name ?? '',
          amountPaise: a.amountPaise,
        }));
      case 'custom':
        return activeProducts
          .map((p) => ({
            productId: p.id,
            productName: p.name,
            amountPaise: rupeesToPaise(parseFloat(customAmounts[p.id] || '0') || 0),
          }))
          .filter((a) => a.amountPaise > 0);
    }
  }, [method, singleProductId, amountPaise, equalAllocations, percentageAllocations, customAmounts, activeProducts]);

  const unallocatedAfter = amountPaise - previewAllocations.reduce((s, a) => s + a.amountPaise, 0);

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    if (amountPaise <= 0) { setErrors('Enter a valid amount'); return false; }
    if (method === 'single') {
      if (!singleProductId) { setErrors('Select a product'); return false; }
    }
    if (method === 'percentage') {
      if (Math.abs(percentageTotal - 100) > 0.2) {
        setErrors(`Percentages must total 100%. Current total: ${percentageTotal.toFixed(1)}%`);
        return false;
      }
    }
    if (method === 'custom') {
      if (customTotal > amountPaise) {
        setErrors(`Custom amounts (${formatCurrency(customTotal)}) exceed the amount being added (${formatCurrency(amountPaise)})`);
        return false;
      }
    }
    setErrors('');
    return true;
  }

  function handleConfirm() {
    if (!validate()) return;
    addMoney(amountPaise, method, previewAllocations);
    closeAddMoney();
  }

  const canSkipConfigure = method === 'unallocated' || method === 'equal';

  function nextStep() {
    if (step === 'amount') {
      if (amountPaise <= 0) { setErrors('Enter a valid amount'); return; }
      setErrors('');
      setStep('method');
    } else if (step === 'method') {
      if (canSkipConfigure) {
        setStep('preview');
      } else {
        setStep('configure');
      }
    } else if (step === 'configure') {
      if (!validate()) return;
      setStep('preview');
    }
  }

  function prevStep() {
    if (step === 'preview') {
      if (canSkipConfigure) {
        setStep('method');
      } else {
        setStep('configure');
      }
    } else if (step === 'configure') {
      setStep('method');
    } else if (step === 'method') {
      setStep('amount');
    }
  }

  function addQuickAmount(rupees: number) {
    const current = parseFloat(amountStr) || 0;
    const next = current + rupees;
    setAmountStr(String(next));
    setErrors('');
  }

  const inputStyle = {
    backgroundColor: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
  };

  const steps: Step[] = canSkipConfigure
    ? ['amount', 'method', 'preview']
    : ['amount', 'method', 'configure', 'preview'];

  if (!addMoneyOpen) return null;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP MODAL (Visible only on md: and larger screens, 100% UNCHANGED)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        <Modal
          isOpen={addMoneyOpen}
          onClose={closeAddMoney}
          title="💰 Add Money to Fund"
          size="lg"
          footer={
            <div className="flex w-full items-center gap-3">
              <div className="flex items-center gap-1 text-xs flex-1" style={{ color: 'var(--text-muted)' }}>
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <span className={`px-2 py-0.5 rounded-full ${step === s ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {i + 1}
                    </span>
                    {i < steps.length - 1 && <span className="text-slate-300 dark:text-slate-600">→</span>}
                  </React.Fragment>
                ))}
              </div>
              {step !== 'amount' && (
                <button onClick={prevStep} className="px-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  Back
                </button>
              )}
              <button onClick={closeAddMoney} className="px-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
              {step === 'preview' ? (
                <button onClick={handleConfirm}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">
                  ✓ Confirm
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (step === 'method' && canSkipConfigure) { setStep('preview'); }
                    else nextStep();
                  }}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">
                  {step === 'configure' ? 'Preview →' : 'Next →'}
                </button>
              )}
            </div>
          }
        >
          {/* Step 1: Amount */}
          {step === 'amount' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Current Fund</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  {formatCurrency(summary.totalFundPaise)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Unallocated: {formatCurrency(summary.unallocatedPaise)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text)' }}>Amount to Add (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: 'var(--text-muted)' }}>₹</span>
                  <input
                    type="number" value={amountStr} onChange={(e) => { setAmountStr(e.target.value); setErrors(''); }}
                    placeholder="0" min="0" step="0.01" autoFocus
                    className="w-full pl-10 pr-4 py-4 rounded-xl text-2xl font-bold outline-none"
                    style={inputStyle}
                  />
                </div>
                {amountStr && amountPaise > 0 && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    New total fund will be: {formatCurrency(summary.totalFundPaise + amountPaise)}
                  </p>
                )}
              </div>
              {errors && <p className="text-sm text-red-500">{errors}</p>}
            </div>
          )}

          {/* Step 2: Method */}
          {step === 'method' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl flex items-center justify-between"
                   style={{ backgroundColor: 'var(--surface-2)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Adding</span>
                <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(amountPaise)}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>How would you like to allocate this money?</p>
              <div className="flex flex-col gap-2">
                {METHOD_INFO.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    disabled={m.id !== 'unallocated' && activeProducts.length === 0}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      method === m.id ? 'ring-2 ring-sky-400' : ''
                    }`}
                    style={{
                      backgroundColor: method === m.id ? 'var(--surface-3)' : 'var(--surface-2)',
                      border: `1.5px solid ${method === m.id ? '#38bdf8' : 'var(--border)'}`,
                      opacity: m.id !== 'unallocated' && activeProducts.length === 0 ? 0.4 : 1,
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${method === m.id ? 'border-sky-400 bg-sky-400' : ''}`}
                         style={method !== m.id ? { borderColor: 'var(--border)' } : {}} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{m.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {activeProducts.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-lg">
                  Add products first to use allocation methods other than "Keep Unallocated".
                </p>
              )}
            </div>
          )}

          {/* Step 3: Configure */}
          {step === 'configure' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-xl flex items-center justify-between"
                   style={{ backgroundColor: 'var(--surface-2)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Allocating</span>
                <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(amountPaise)}</span>
              </div>

              {/* Single Product */}
              {method === 'single' && (
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text)' }}>Select Product</label>
                  <select value={singleProductId} onChange={(e) => setSingleProductId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
                    {activeProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (allocated: {formatCurrency(p.allocatedPaise)} / {formatCurrency(p.pricePaise)})
                      </option>
                    ))}
                  </select>
                  {singleProductId && (() => {
                    const product = activeProducts.find((p) => p.id === singleProductId);
                    if (!product) return null;
                    const newAlloc = product.allocatedPaise + amountPaise;
                    const willOverfund = newAlloc > product.pricePaise;
                    return (
                      <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${willOverfund ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'}`}>
                        After: {formatCurrency(newAlloc)} / {formatCurrency(product.pricePaise)}
                        {willOverfund && ` ⚠ This will overfund by ${formatCurrency(newAlloc - product.pricePaise)}`}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Percentage */}
              {method === 'percentage' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Assign Percentages</label>
                    <span className={`text-xs ${Math.abs(percentageTotal - 100) <= 0.2 ? 'text-emerald-500 font-semibold' : 'text-amber-500'}`}>
                      Total: {percentageTotal.toFixed(1)}% {Math.abs(percentageTotal - 100) <= 0.2 ? '✓' : '(must be 100%)'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {activeProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-sm flex-1 truncate" style={{ color: 'var(--text)' }}>{p.name}</span>
                        <div className="relative w-28 flex-shrink-0">
                          <input type="number" value={percentages[p.id] ?? ''}
                            onChange={(e) => setPercentages({ ...percentages, [p.id]: e.target.value })}
                            min="0" max="100" step="1" placeholder="0"
                            className="w-full pr-6 pl-3 py-2 rounded-lg text-sm outline-none text-right" style={inputStyle} />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>%</span>
                        </div>
                        <span className="text-xs w-20 text-right" style={{ color: 'var(--text-muted)' }}>
                          = {formatCurrency(Math.round(amountPaise * (parseFloat(percentages[p.id] || '0') || 0) / 100))}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Quick distribute evenly button */}
                  <button
                    onClick={() => {
                      const n = activeProducts.length;
                      if (n === 0) return;
                      const base = Math.floor((100 / n) * 100) / 100;
                      const remainder = Math.round((100 - base * n) * 100) / 100;
                      const newPcts: Record<string, string> = {};
                      activeProducts.forEach((p, idx) => {
                        const val = idx === n - 1 ? (base + remainder).toFixed(2) : base.toFixed(2);
                        newPcts[p.id] = val;
                      });
                      setPercentages(newPcts);
                    }}
                    className="mt-3 text-xs text-sky-500 hover:text-sky-600 underline cursor-pointer"
                  >
                    Distribute equally (each {(100 / activeProducts.length).toFixed(1)}%)
                  </button>
                </div>
              )}

              {/* Custom */}
              {method === 'custom' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Enter Amounts (₹)</label>
                    <span className={`text-xs font-bold ${customTotal > amountPaise ? 'text-red-500' : 'text-emerald-600'}`}>
                      {formatCurrency(customTotal)} / {formatCurrency(amountPaise)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {activeProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-sm flex-1 truncate" style={{ color: 'var(--text)' }}>{p.name}</span>
                        <div className="relative w-32 flex-shrink-0">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>₹</span>
                          <input type="number" value={customAmounts[p.id] ?? ''}
                            onChange={(e) => setCustomAmounts({ ...customAmounts, [p.id]: e.target.value })}
                            min="0" step="0.01" placeholder="0"
                            className="w-full pl-6 pr-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Remaining (Unallocated)</span>
                      <span className="text-xs font-bold" style={{ color: customTotal > amountPaise ? '#ef4444' : '#059669' }}>
                        {formatCurrency(Math.max(0, amountPaise - customTotal))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {errors && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-lg">{errors}</p>}
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 'preview' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Preview Allocation</p>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'var(--text-muted)' }}>Amount Adding</span>
                  <span className="font-bold text-sky-600">{formatCurrency(amountPaise)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span style={{ color: 'var(--text-muted)' }}>Method</span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    {METHOD_INFO.find(m => m.id === method)?.label}
                  </span>
                </div>

                {previewAllocations.length > 0 && (
                  <>
                    <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Product Allocations</p>
                      <div className="flex flex-col gap-1.5">
                        {previewAllocations.map((a) => {
                          const pct = amountPaise > 0 ? ((a.amountPaise / amountPaise) * 100).toFixed(1) : '0';
                          return (
                            <div key={a.productId} className="flex justify-between items-center">
                              <span className="text-sm" style={{ color: 'var(--text)' }}>{a.productName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                                <span className="text-sm font-semibold text-sky-600">+{formatCurrency(a.amountPaise)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {unallocatedAfter > 0 && (
                  <div className="flex justify-between items-center pt-2 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Stays Unallocated</span>
                    <span className="text-sm font-semibold text-slate-500">{formatCurrency(unallocatedAfter)}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Fund After This Action</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Fund', value: formatCurrency(summary.totalFundPaise + amountPaise), accent: '#0284c7' },
                    { label: 'Unallocated', value: formatCurrency(summary.unallocatedPaise + unallocatedAfter), accent: '#059669' },
                  ].map(({ label, value, accent }) => (
                    <div key={label}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      <p className="text-base font-bold" style={{ color: accent }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE DEDICATED FULL-SCREEN PAGE (Visible only on < md screens)
          Native mobile app navigation flow with sticky bottom controls
         ══════════════════════════════════════════════════════════════════ */}
      <div
        className="md:hidden fixed inset-0 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
      >
        {/* Mobile Header Bar */}
        <header
          className="h-14 px-4 flex items-center justify-between border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={step === 'amount' ? closeAddMoney : prevStep}
            className="flex items-center gap-1 py-2 pr-2 text-sm font-semibold cursor-pointer active:opacity-70 transition-opacity"
            style={{ color: 'var(--text)' }}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <h1 className="text-base font-bold truncate text-center flex-1 mx-2" style={{ color: 'var(--text)' }}>
            Add Money to Fund
          </h1>

          <button
            onClick={closeAddMoney}
            className="p-2 rounded-xl text-xs font-semibold cursor-pointer active:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Cancel"
          >
            <X size={18} />
          </button>
        </header>

        {/* Mobile Step Indicator */}
        <div
          className="px-4 pt-3 pb-2.5 border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-bold text-xs" style={{ color: 'var(--text)' }}>
              Step {stepNames[step].stepNumber} of 4
            </span>
            <span className="font-semibold text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {stepNames[step].label}
            </span>
          </div>
          {/* 4-Segment Bar */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((num) => {
              const isComplete = stepNames[step].stepNumber > num;
              const isCurrent = stepNames[step].stepNumber === num;
              return (
                <div
                  key={num}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isComplete || isCurrent ? '#6366f1' : 'var(--border)',
                    opacity: isCurrent ? 1 : isComplete ? 0.8 : 0.4,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 flex flex-col gap-4">
          {/* Step 1: Amount */}
          {step === 'amount' && (
            <div className="flex flex-col gap-4">
              {/* Current Fund Card */}
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Current Total Fund
                  </p>
                  <p className="text-xl font-extrabold mt-0.5" style={{ color: 'var(--text)' }}>
                    {formatCurrency(summary.totalFundPaise)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Unallocated
                  </p>
                  <p className="text-base font-bold mt-0.5 text-emerald-600">
                    {formatCurrency(summary.unallocatedPaise)}
                  </p>
                </div>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold block" style={{ color: 'var(--text)' }}>
                  How much money would you like to add?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black" style={{ color: 'var(--text-muted)' }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => { setAmountStr(e.target.value); setErrors(''); }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    autoFocus
                    className="w-full pl-11 pr-4 py-4 rounded-2xl text-2xl font-black outline-none tracking-tight transition-colors"
                    style={inputStyle}
                  />
                </div>

                {/* Quick Add Amount Chips */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[1000, 5000, 10000, 25000, 50000].map((rupees) => (
                    <button
                      key={rupees}
                      type="button"
                      onClick={() => addQuickAmount(rupees)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.95] cursor-pointer"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      +{formatCurrency(rupees * 100).replace(/\.00$/, '')}
                    </button>
                  ))}
                </div>

                {amountStr && amountPaise > 0 && (
                  <div
                    className="p-3 rounded-xl text-xs font-semibold flex items-center justify-between mt-1"
                    style={{ backgroundColor: 'var(--accent-progress-bg)', color: '#6366f1' }}
                  >
                    <span>New Total Fund after adding:</span>
                    <span className="font-bold text-sm">{formatCurrency(summary.totalFundPaise + amountPaise)}</span>
                  </div>
                )}
              </div>

              {errors && (
                <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl">
                  {errors}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Method */}
          {step === 'method' && (
            <div className="flex flex-col gap-3.5">
              <div
                className="p-3.5 rounded-2xl flex items-center justify-between"
                style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Adding Amount
                </span>
                <span className="text-lg font-extrabold text-indigo-500">{formatCurrency(amountPaise)}</span>
              </div>

              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                How would you like to allocate this money?
              </p>

              <div className="flex flex-col gap-2.5">
                {METHOD_INFO.map((m) => {
                  const isSelected = method === m.id;
                  const isDisabled = m.id !== 'unallocated' && activeProducts.length === 0;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      disabled={isDisabled}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all active:scale-[0.99] cursor-pointer ${
                        isSelected ? 'shadow-sm' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--accent-progress-bg)' : 'var(--surface)',
                        border: `1.5px solid ${isSelected ? '#6366f1' : 'var(--border)'}`,
                        opacity: isDisabled ? 0.4 : 1,
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: isSelected ? '#6366f1' : 'var(--text)' }}>
                          {m.label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeProducts.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl">
                  Add products first to use allocation methods other than "Keep Unallocated".
                </p>
              )}
            </div>
          )}

          {/* Step 3: Configure */}
          {step === 'configure' && (
            <div className="flex flex-col gap-4">
              <div
                className="p-3.5 rounded-2xl flex items-center justify-between"
                style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Total Allocating
                </span>
                <span className="text-lg font-extrabold text-indigo-500">{formatCurrency(amountPaise)}</span>
              </div>

              {/* Single Product */}
              {method === 'single' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold block" style={{ color: 'var(--text)' }}>
                    Choose the target product
                  </label>
                  <select
                    value={singleProductId}
                    onChange={(e) => setSingleProductId(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-xl text-sm font-medium outline-none cursor-pointer"
                    style={inputStyle}
                  >
                    {activeProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Has {formatCurrency(p.allocatedPaise)} of {formatCurrency(p.pricePaise)})
                      </option>
                    ))}
                  </select>

                  {singleProductId && (() => {
                    const product = activeProducts.find((p) => p.id === singleProductId);
                    if (!product) return null;
                    const newAlloc = product.allocatedPaise + amountPaise;
                    const willOverfund = newAlloc > product.pricePaise;
                    return (
                      <div
                        className={`mt-2 p-3.5 rounded-2xl text-xs flex flex-col gap-1 border ${
                          willOverfund
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200'
                            : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200'
                        }`}
                      >
                        <div className="flex justify-between font-semibold">
                          <span>Product Status After Allocation:</span>
                          <span className="font-bold">{formatCurrency(newAlloc)} / {formatCurrency(product.pricePaise)}</span>
                        </div>
                        {willOverfund && (
                          <span className="font-bold text-amber-600">
                            ⚠ This will overfund by {formatCurrency(newAlloc - product.pricePaise)}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Percentage */}
              {method === 'percentage' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                      Assign Percentages
                    </label>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        Math.abs(percentageTotal - 100) <= 0.2
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}
                    >
                      {percentageTotal.toFixed(1)}% / 100% {Math.abs(percentageTotal - 100) <= 0.2 ? '✓' : ''}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {activeProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl flex items-center justify-between gap-3 border"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                      >
                        <span className="text-sm font-semibold truncate flex-1" style={{ color: 'var(--text)' }}>
                          {p.name}
                        </span>
                        <div className="relative w-24 flex-shrink-0">
                          <input
                            type="number"
                            value={percentages[p.id] ?? ''}
                            onChange={(e) => setPercentages({ ...percentages, [p.id]: e.target.value })}
                            min="0"
                            max="100"
                            step="1"
                            placeholder="0"
                            className="w-full pr-6 pl-3 h-10 rounded-lg text-sm font-bold outline-none text-right"
                            style={inputStyle}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            %
                          </span>
                        </div>
                        <span className="text-xs font-semibold w-18 text-right text-indigo-500 flex-shrink-0">
                          {formatCurrency(Math.round(amountPaise * (parseFloat(percentages[p.id] || '0') || 0) / 100))}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const n = activeProducts.length;
                      if (n === 0) return;
                      const base = Math.floor((100 / n) * 100) / 100;
                      const remainder = Math.round((100 - base * n) * 100) / 100;
                      const newPcts: Record<string, string> = {};
                      activeProducts.forEach((p, idx) => {
                        const val = idx === n - 1 ? (base + remainder).toFixed(2) : base.toFixed(2);
                        newPcts[p.id] = val;
                      });
                      setPercentages(newPcts);
                    }}
                    className="text-xs font-semibold text-indigo-500 hover:underline self-start py-1 cursor-pointer"
                  >
                    Distribute equally (each {(100 / activeProducts.length).toFixed(1)}%)
                  </button>
                </div>
              )}

              {/* Custom */}
              {method === 'custom' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                      Enter Exact Amounts
                    </label>
                    <span className={`text-xs font-extrabold ${customTotal > amountPaise ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {formatCurrency(customTotal)} / {formatCurrency(amountPaise)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {activeProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl flex items-center justify-between gap-3 border"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                      >
                        <span className="text-sm font-semibold truncate flex-1" style={{ color: 'var(--text)' }}>
                          {p.name}
                        </span>
                        <div className="relative w-32 flex-shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                            ₹
                          </span>
                          <input
                            type="number"
                            value={customAmounts[p.id] ?? ''}
                            onChange={(e) => setCustomAmounts({ ...customAmounts, [p.id]: e.target.value })}
                            min="0"
                            step="0.01"
                            placeholder="0"
                            className="w-full pl-6 pr-3 h-10 rounded-lg text-sm font-bold outline-none"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="p-3 rounded-xl flex items-center justify-between text-xs border"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <span className="font-medium" style={{ color: 'var(--text-muted)' }}>
                      Remaining (Unallocated):
                    </span>
                    <span className="font-extrabold text-sm" style={{ color: customTotal > amountPaise ? '#ef4444' : '#059669' }}>
                      {formatCurrency(Math.max(0, amountPaise - customTotal))}
                    </span>
                  </div>
                </div>
              )}

              {errors && (
                <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl">
                  {errors}
                </p>
              )}
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 'preview' && (
            <div className="flex flex-col gap-4">
              {/* Allocation Summary Card */}
              <div
                className="p-4 rounded-2xl flex flex-col gap-3 shadow-sm border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Allocation Breakdown
                </p>

                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Total Adding</span>
                  <span className="font-extrabold text-base text-indigo-500">+{formatCurrency(amountPaise)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Method</span>
                  <span className="font-bold" style={{ color: 'var(--text)' }}>
                    {METHOD_INFO.find((m) => m.id === method)?.label}
                  </span>
                </div>

                {previewAllocations.length > 0 && (
                  <div className="border-t pt-3 mt-1" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                      Assigned to Products
                    </p>
                    <div className="flex flex-col gap-2">
                      {previewAllocations.map((a) => {
                        const pct = amountPaise > 0 ? ((a.amountPaise / amountPaise) * 100).toFixed(1) : '0';
                        return (
                          <div
                            key={a.productId}
                            className="p-2.5 rounded-xl flex items-center justify-between text-xs"
                            style={{ backgroundColor: 'var(--surface-2)' }}
                          >
                            <span className="font-semibold truncate flex-1 mr-2" style={{ color: 'var(--text)' }}>
                              {a.productName}
                            </span>
                            <span className="text-[11px] mr-2.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                              {pct}%
                            </span>
                            <span className="font-bold text-sky-500 text-sm">
                              +{formatCurrency(a.amountPaise)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {unallocatedAfter > 0 && (
                  <div className="flex justify-between items-center pt-2 mt-1 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Stays Unallocated:</span>
                    <span className="font-bold text-slate-500">{formatCurrency(unallocatedAfter)}</span>
                  </div>
                )}
              </div>

              {/* Fund After Action Card */}
              <div
                className="p-4 rounded-2xl flex flex-col gap-2.5 shadow-sm border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Fund Status After Adding
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>New Total Fund</p>
                    <p className="text-base font-extrabold text-sky-500">
                      {formatCurrency(summary.totalFundPaise + amountPaise)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>New Unallocated</p>
                    <p className="text-base font-extrabold text-emerald-600">
                      {formatCurrency(summary.unallocatedPaise + unallocatedAfter)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Area on Mobile */}
        <div
          className="fixed bottom-0 left-0 right-0 p-3.5 border-t z-50 flex items-center gap-2.5 shadow-lg"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {step === 'amount' ? (
            <>
              <button
                type="button"
                onClick={closeAddMoney}
                className="h-12 min-h-[48px] px-5 rounded-xl text-sm font-semibold border active:scale-[0.98] transition-all cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 h-12 min-h-[48px] rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
            </>
          ) : step === 'preview' ? (
            <>
              <button
                type="button"
                onClick={prevStep}
                className="h-12 min-h-[48px] px-5 rounded-xl text-sm font-semibold border active:scale-[0.98] transition-all cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 h-12 min-h-[48px] rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>✓ Confirm & Add Money</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={prevStep}
                className="h-12 min-h-[48px] px-5 rounded-xl text-sm font-semibold border active:scale-[0.98] transition-all cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (step === 'method' && canSkipConfigure) {
                    setStep('preview');
                  } else {
                    nextStep();
                  }
                }}
                className="flex-1 h-12 min-h-[48px] rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <span>{step === 'configure' || (step === 'method' && canSkipConfigure) ? 'Preview' : 'Continue'}</span>
                <span>→</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
