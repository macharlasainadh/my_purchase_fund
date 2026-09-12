import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useModalStore } from '../../store/useModalStore';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { formatCurrency, rupeesToPaise, paiseToRupees } from '../../utils/currency';
import type { Goal, GoalCategory, Priority } from '../../types';

const GOAL_CATEGORIES: { value: GoalCategory; label: string; emoji: string }[] = [
  { value: 'investment',  label: 'Investment',      emoji: '📈' },
  { value: 'travel',      label: 'Travel / Vacation',emoji: '✈️' },
  { value: 'emergency',   label: 'Emergency Fund',  emoji: '🛡️' },
  { value: 'education',   label: 'Education',       emoji: '🎓' },
  { value: 'retirement',  label: 'Retirement',      emoji: '🌅' },
  { value: 'home',        label: 'Home / Real Estate',emoji: '🏠' },
  { value: 'health',      label: 'Health',          emoji: '❤️' },
  { value: 'purchase',    label: 'Big Purchase',    emoji: '🛒' },
  { value: 'other',       label: 'Other',           emoji: '⭐' },
];

const GOAL_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#f43f5e', '#8b5cf6', '#14b8a6', '#f97316',
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
];

interface Form {
  name: string;
  description: string;
  category: GoalCategory;
  targetAmount: string;
  monthlyContribution: string;
  targetDate: string;
  priority: Priority;
  color: string;
  notes: string;
}

const empty: Form = {
  name: '', description: '', category: 'investment',
  targetAmount: '', monthlyContribution: '', targetDate: '',
  priority: 'medium', color: GOAL_COLORS[0], notes: '',
};

export function GoalFormModal() {
  const { goalFormOpen, goalFormEditTarget, closeGoalForm } = useModalStore();
  const { addGoal, updateGoal } = usePurchaseStore();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Form>>({});

  const isEdit = !!goalFormEditTarget;

  useEffect(() => {
    if (goalFormOpen) {
      if (goalFormEditTarget) {
        setForm({
          name: goalFormEditTarget.name,
          description: goalFormEditTarget.description ?? '',
          category: goalFormEditTarget.category,
          targetAmount: String(paiseToRupees(goalFormEditTarget.targetAmountPaise)),
          monthlyContribution: goalFormEditTarget.monthlyContributionPaise
            ? String(paiseToRupees(goalFormEditTarget.monthlyContributionPaise)) : '',
          targetDate: goalFormEditTarget.targetDate ?? '',
          priority: goalFormEditTarget.priority,
          color: goalFormEditTarget.color,
          notes: goalFormEditTarget.notes ?? '',
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [goalFormOpen, goalFormEditTarget]);

  function validate(): boolean {
    const e: Partial<Form> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.targetAmount || isNaN(+form.targetAmount) || +form.targetAmount <= 0)
      e.targetAmount = 'Enter a valid target amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      targetAmountPaise: rupeesToPaise(parseFloat(form.targetAmount)),
      monthlyContributionPaise: form.monthlyContribution ? rupeesToPaise(parseFloat(form.monthlyContribution)) : undefined,
      targetDate: form.targetDate || undefined,
      priority: form.priority,
      color: form.color,
      notes: form.notes.trim() || undefined,
    };
    if (isEdit && goalFormEditTarget) {
      updateGoal(goalFormEditTarget.id, data);
    } else {
      addGoal(data);
    }
    closeGoalForm();
  }

  const f = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
  };
  const labelStyle: React.CSSProperties = { color: 'var(--text)' };
  const errorStyle: React.CSSProperties = { color: '#f43f5e', fontSize: 11 };

  return (
    <Modal
      isOpen={goalFormOpen}
      onClose={closeGoalForm}
      title={isEdit ? '✏️ Edit Goal' : '🎯 New Long-term Goal'}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={closeGoalForm}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border active:scale-[0.98] transition-all cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
            style={{ backgroundColor: form.color || '#6366f1' }}
          >
            {isEdit ? 'Save Changes' : 'Save Goal'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium block mb-1" style={labelStyle}>Goal Name *</label>
          <input value={form.name} onChange={f('name')} placeholder="e.g. Emergency Fund, Europe Trip…"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>

        {/* Category + Priority row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Category</label>
            <select value={form.category} onChange={f('category')}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
              {GOAL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Priority</label>
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button key={p.value} onClick={() => setForm({ ...form, priority: p.value })}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: form.priority === p.value ? form.color : 'var(--surface-2)',
                    color: form.priority === p.value ? '#fff' : 'var(--text-muted)',
                    border: `1.5px solid ${form.priority === p.value ? form.color : 'var(--border)'}`,
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target amount + Monthly contribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Target Amount (₹) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input type="number" value={form.targetAmount} onChange={f('targetAmount')}
                placeholder="0" min="0" step="0.01"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-bold outline-none" style={inputStyle} />
            </div>
            {errors.targetAmount && <p style={errorStyle}>{errors.targetAmount}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Monthly Plan (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input type="number" value={form.monthlyContribution} onChange={f('monthlyContribution')}
                placeholder="Optional" min="0" step="0.01"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-bold outline-none" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Target date + Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Target Date</label>
            <input type="date" value={form.targetDate} onChange={f('targetDate')}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Short Description</label>
            <input value={form.description} onChange={f('description')} placeholder="Optional tagline"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="text-sm font-medium block mb-2" style={labelStyle}>Card Color</label>
          <div className="flex gap-2 flex-wrap">
            {GOAL_COLORS.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: form.color === c ? `3px solid ${c}` : 'none',
                  outlineOffset: 2,
                  transform: form.color === c ? 'scale(1.18)' : undefined,
                }} />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium block mb-1" style={labelStyle}>Notes</label>
          <textarea value={form.notes} onChange={f('notes')} placeholder="Why this goal? Any context…"
            rows={2} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
        </div>
      </div>
    </Modal>
  );
}
