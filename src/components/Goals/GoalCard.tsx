import React, { useState, useMemo } from 'react';
import { differenceInDays, differenceInMonths } from 'date-fns';
import { formatDateSafe, parseISOSafe } from '../../utils/date';
import { Pencil, Trash2, TrendingUp, Calendar, Target, Trophy, ChevronDown, ChevronUp, History } from 'lucide-react';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { useModalStore } from '../../store/useModalStore';
import { formatCurrency } from '../../utils/currency';
import type { Goal, GoalCategory } from '../../types';

const CAT_EMOJI: Record<GoalCategory, string> = {
  investment: '📈', travel: '✈️', emergency: '🛡️', education: '🎓',
  retirement: '🌅', home: '🏠', health: '❤️', purchase: '🛒', other: '⭐',
};

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { transactions, deleteGoal, markGoalAchieved } = usePurchaseStore();
  const { openGoalForm, openGoalContribute, openConfirm } = useModalStore();
  const [showHistory, setShowHistory] = useState(false);

  const percent = goal.targetAmountPaise === 0
    ? 0
    : Math.min(100, Math.round((goal.savedAmountPaise / goal.targetAmountPaise) * 1000) / 10);

  const remaining = Math.max(0, goal.targetAmountPaise - goal.savedAmountPaise);

  // Per-goal transaction history
  const goalTransactions = useMemo(() => {
    return transactions.filter(
      (tx) =>
        (tx.type === 'goal_contribute' || tx.type === 'goal_withdraw') &&
        (tx.toProductId === goal.id ||
          tx.fromProductId === goal.id ||
          tx.description.toLowerCase().includes(goal.name.toLowerCase()))
    );
  }, [transactions, goal.id, goal.name]);

  // Time calculations
  let daysLeft: number | null = null;
  let monthsLeft: number | null = null;
  let monthlyNeeded: number | null = null;
  if (goal.targetDate) {
    const target = parseISOSafe(goal.targetDate);
    if (target) {
      const now = new Date();
      daysLeft = differenceInDays(target, now);
      monthsLeft = Math.max(0, differenceInMonths(target, now));
      if (monthsLeft > 0 && remaining > 0) {
        monthlyNeeded = Math.ceil(remaining / monthsLeft);
      }
    }
  }

  function handleDelete() {
    openConfirm(
      'Delete Goal',
      `Delete "${goal.name}"? ${goal.savedAmountPaise > 0 ? formatCurrency(goal.savedAmountPaise) + ' will be returned to your unallocated fund.' : ''}`,
      () => deleteGoal(goal.id)
    );
  }

  const accentLight = `${goal.color}18`;
  const accentMed   = `${goal.color}35`;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ border: `1.5px solid ${goal.color}50`, backgroundColor: 'var(--surface)' }}
    >
      {/* Header stripe */}
      <div className="px-4 py-3 flex items-start justify-between gap-2"
           style={{ backgroundColor: accentLight }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl flex-shrink-0">{CAT_EMOJI[goal.category]}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate" style={{ color: goal.color }}>{goal.name}</h3>
            {goal.description && (
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{goal.description}</p>
            )}
          </div>
        </div>
        {goal.achieved && (
          <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: goal.color }}>
            <Trophy size={11} /> Achieved!
          </span>
        )}
      </div>

      {/* Progress section */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-end justify-between mb-1.5">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saved</p>
            <p className="text-xl font-bold" style={{ color: goal.color }}>
              {formatCurrency(goal.savedAmountPaise)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target</p>
            <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              {formatCurrency(goal.targetAmountPaise)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'var(--bar-track)' }}>
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{ width: `${percent}%`, backgroundColor: goal.color }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: goal.color }}>{percent}%</span>
          {remaining > 0 && <span>{formatCurrency(remaining)} to go</span>}
          {remaining === 0 && <span className="text-emerald-600 font-semibold">✓ Goal reached!</span>}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2">
        {goal.targetDate && (
          <div className="flex flex-col items-center p-2 rounded-xl" style={{ backgroundColor: accentLight }}>
            <Calendar size={13} style={{ color: goal.color }} className="mb-0.5" />
            <p className="text-xs font-semibold" style={{ color: goal.color }}>
              {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d` : 'Overdue'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDateSafe(goal.targetDate, 'MMM yy')}
            </p>
          </div>
        )}
        {monthlyNeeded !== null && (
          <div className="flex flex-col items-center p-2 rounded-xl" style={{ backgroundColor: accentLight }}>
            <TrendingUp size={13} style={{ color: goal.color }} className="mb-0.5" />
            <p className="text-xs font-semibold" style={{ color: goal.color }}>
              {formatCurrency(monthlyNeeded)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/ month</p>
          </div>
        )}
        {goal.monthlyContributionPaise && (
          <div className="flex flex-col items-center p-2 rounded-xl" style={{ backgroundColor: accentLight }}>
            <Target size={13} style={{ color: goal.color }} className="mb-0.5" />
            <p className="text-xs font-semibold" style={{ color: goal.color }}>
              {formatCurrency(goal.monthlyContributionPaise)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>planned/mo</p>
          </div>
        )}
      </div>

      {goal.notes && (
        <p className="px-4 pb-2 text-xs italic" style={{ color: 'var(--text-muted)' }}>{goal.notes}</p>
      )}

      {/* Per-Goal Savings Activity History */}
      {goalTransactions.length > 0 && (
        <div className="px-4 py-1.5 border-t mt-auto" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-xs py-1 transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <History size={12} style={{ color: goal.color }} />
              Savings Activity ({goalTransactions.length})
            </span>
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showHistory && (
            <div className="flex flex-col gap-1.5 pt-1.5 pb-1 max-h-36 overflow-y-auto pr-1">
              {goalTransactions.slice(0, 6).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg"
                  style={{ backgroundColor: 'var(--surface-2)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[11px]" style={{ color: 'var(--text)' }}>
                      {tx.type === 'goal_contribute' ? 'Deposit' : 'Withdrawal'}
                      {tx.notes ? ` · ${tx.notes}` : ''}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {formatDateSafe(tx.date, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span
                    className={`font-semibold text-xs ml-2 ${
                      tx.type === 'goal_contribute' ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {tx.type === 'goal_contribute' ? '+' : '-'}{formatCurrency(tx.amountPaise)}
                  </span>
                </div>
              ))}
              {goalTransactions.length > 6 && (
                <p className="text-[10px] text-center italic mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                  +{goalTransactions.length - 6} older transactions
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 pb-3 pt-2 flex items-center gap-2">
        <button
          onClick={() => openGoalContribute(goal)}
          className="flex-1 h-11 min-h-[44px] sm:h-auto sm:py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
          style={{ backgroundColor: goal.color }}
        >
          + Contribute
        </button>
        {!goal.achieved && remaining === 0 && (
          <button
            onClick={() => markGoalAchieved(goal.id)}
            className="h-11 min-h-[44px] sm:h-auto sm:py-2 px-3 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] cursor-pointer flex items-center justify-center"
            title="Mark Goal as Achieved"
          >
            <Trophy size={16} />
          </button>
        )}
        <button
          onClick={() => openGoalForm(goal)}
          className="h-11 min-h-[44px] sm:h-auto sm:py-2 px-3 rounded-xl text-sm transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: accentMed, color: goal.color }}
          title="Edit goal"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={handleDelete}
          className="h-11 min-h-[44px] sm:h-auto sm:py-2 px-3 rounded-xl text-sm text-rose-500 transition-colors hover:bg-rose-500/10 active:scale-[0.98] cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-2)' }}
          title="Delete goal"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
