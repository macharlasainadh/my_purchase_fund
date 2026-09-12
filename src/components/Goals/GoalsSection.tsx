import React from 'react';
import { Target } from 'lucide-react';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { useModalStore } from '../../store/useModalStore';
import { formatCurrency } from '../../utils/currency';
import { GoalCard } from './GoalCard';

export function GoalsSection() {
  const { goals } = usePurchaseStore();
  const { openGoalForm } = useModalStore();

  const activeGoals   = goals.filter((g) => !g.achieved);
  const achievedGoals = goals.filter((g) =>  g.achieved);
  const totalSaved    = goals.reduce((s, g) => s + g.savedAmountPaise, 0);
  const totalTarget   = goals.reduce((s, g) => s + g.targetAmountPaise, 0);

  return (
    <div className="mt-4 sm:mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Long-term Goals</h2>
          {goals.length > 0 && (
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              {formatCurrency(totalSaved)} saved of {formatCurrency(totalTarget)} total across {goals.length} goal{goals.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => openGoalForm()}
          className="h-11 min-h-[44px] sm:h-auto px-4 sm:py-2 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm"
        >
          + New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="py-6 sm:py-12 px-4 flex flex-col items-center rounded-2xl"
             style={{ border: '1.5px dashed var(--border)', backgroundColor: 'var(--surface)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
               style={{ backgroundColor: 'var(--surface-2)' }}>
            <Target size={22} style={{ color: 'var(--accent-progress)' }} />
          </div>
          <h3 className="text-sm sm:text-base font-bold mb-0.5 text-center" style={{ color: 'var(--text)' }}>No goals yet</h3>
          <p className="text-xs text-center max-w-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Set long-term savings goals — emergency fund, travel, education, and track your monthly progress.
          </p>
          <button
            onClick={() => openGoalForm()}
            className="h-10 min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm"
          >
            + Create First Goal
          </button>
        </div>
      ) : (
        <>
          {/* Active goals grid */}
          {activeGoals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}

          {/* Achieved goals */}
          {achievedGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}>
                🏆 Achieved Goals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
