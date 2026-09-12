import React, { useState, useMemo } from 'react';
import { isToday, isYesterday } from 'date-fns';
import { formatDateSafe, parseISOSafe } from '../../utils/date';
import {
  ArrowRight, Plus, RefreshCw, ShoppingCart, Trash2, Tag,
  Target, ArrowDownLeft, Search, Filter, X
} from 'lucide-react';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { useModalStore } from '../../store/useModalStore';
import { formatCurrency } from '../../utils/currency';
import type { Transaction, TransactionType } from '../../types';

const TX_ICONS: Record<string, React.ReactNode> = {
  add_money: <Plus size={14} />,
  move_money: <ArrowRight size={14} />,
  redistribute: <RefreshCw size={14} />,
  price_change: <Tag size={14} />,
  mark_purchased: <ShoppingCart size={14} />,
  remove_product: <Trash2 size={14} />,
  goal_contribute: <Target size={14} />,
  goal_withdraw: <ArrowDownLeft size={14} />,
};

const TX_COLORS: Record<string, string> = {
  add_money: '#0ea5e9',
  move_money: '#8b5cf6',
  redistribute: '#f59e0b',
  price_change: '#64748b',
  mark_purchased: '#10b981',
  remove_product: '#ef4444',
  goal_contribute: '#10b981',
  goal_withdraw: '#f43f5e',
};

const TX_TYPE_LABELS: Record<TransactionType, string> = {
  add_money: 'Add Money',
  move_money: 'Move Money',
  redistribute: 'Redistribute',
  price_change: 'Price Change',
  mark_purchased: 'Purchased',
  remove_product: 'Removed Product',
  goal_contribute: 'Goal Contribution',
  goal_withdraw: 'Goal Withdrawal',
};

function TxCard({ tx }: { tx: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const color = TX_COLORS[tx.type] ?? '#64748b';

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {TX_ICONS[tx.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
            {tx.description}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {formatDateSafe(tx.date, 'MMM d, yyyy · h:mm a')}
          </p>
          {tx.notes && (
            <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-subtle)' }}>
              {tx.notes}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {tx.type === 'add_money' && (
            <span className="text-sm font-bold" style={{ color }}>+{formatCurrency(tx.amountPaise)}</span>
          )}
          {tx.type === 'move_money' && (
            <span className="text-sm font-bold" style={{ color }}>{formatCurrency(tx.amountPaise)}</span>
          )}
          {tx.type === 'mark_purchased' && (
            <span className="text-sm font-bold text-emerald-600">-{formatCurrency(tx.amountPaise)}</span>
          )}
          {tx.type === 'goal_contribute' && (
            <span className="text-sm font-bold text-emerald-600">+{formatCurrency(tx.amountPaise)}</span>
          )}
          {tx.type === 'goal_withdraw' && (
            <span className="text-sm font-bold text-rose-500">-{formatCurrency(tx.amountPaise)}</span>
          )}
          {(tx.type === 'redistribute' || tx.type === 'remove_product' || tx.type === 'price_change') && tx.amountPaise > 0 && (
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              {formatCurrency(tx.amountPaise)}
            </span>
          )}
        </div>
      </div>

      {expanded && tx.allocations && tx.allocations.length > 0 && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mt-3 mb-2" style={{ color: 'var(--text-muted)' }}>
            Allocations
          </p>
          <div className="flex flex-col gap-1">
            {tx.allocations.map((a) => (
              <div key={a.productId} className="flex justify-between text-xs">
                <span style={{ color: 'var(--text)' }}>{a.productName}</span>
                <span style={{ color }}>{formatCurrency(a.amountPaise)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getRelativeDateLabel(dateStr?: string | null): string {
  if (!dateStr) return 'Recent';
  const parsed = parseISOSafe(dateStr);
  if (!parsed) return 'Recent';
  if (isToday(parsed)) return 'Today';
  if (isYesterday(parsed)) return 'Yesterday';
  return formatDateSafe(dateStr, 'MMMM d, yyyy', 'Recent');
}

function groupByDate(transactions: Transaction[]): { date: string; txs: Transaction[] }[] {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const key = getRelativeDateLabel(tx.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return Object.entries(groups).map(([date, txs]) => ({ date, txs }));
}

export function TransactionHistory() {
  const { transactions } = usePurchaseStore();
  const { openAddMoney } = useModalStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((tx) =>
        tx.description.toLowerCase().includes(q) ||
        (tx.notes ?? '').toLowerCase().includes(q) ||
        (tx.allocations ?? []).some((a) => a.productName.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      list = list.filter((tx) => tx.type === typeFilter);
    }

    if (sortOrder === 'oldest') {
      list.reverse();
    }

    return list;
  }, [transactions, search, typeFilter, sortOrder]);

  const groups = useMemo(() => groupByDate(filteredTransactions), [filteredTransactions]);

  if (transactions.length === 0) {
    return (
      <div className="mt-3 sm:mt-6 py-6 sm:py-12 px-4 flex flex-col items-center rounded-2xl"
           style={{ border: '1.5px dashed var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
             style={{ backgroundColor: 'var(--surface-2)' }}>
          <RefreshCw size={20} style={{ color: 'var(--text-subtle)' }} />
        </div>
        <h3 className="text-sm sm:text-base font-bold mb-0.5 text-center" style={{ color: 'var(--text)' }}>No transactions yet</h3>
        <p className="text-xs mb-3 text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Add money or allocate funds to see your activity log here.
        </p>
        <button
          onClick={() => openAddMoney()}
          className="h-10 min-h-[40px] flex items-center gap-1.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} />
          Add Money to Fund
        </button>
      </div>
    );
  }

  const isFiltering = search.trim() !== '' || typeFilter !== 'all';

  return (
    <div className="mt-4 sm:mt-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            Transaction History
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description, product, or note..."
            className="w-full pl-9 pr-8 h-11 sm:h-auto sm:py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              color: 'var(--text)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-xs transition-colors hover:opacity-75 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Transaction Type Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto h-11 min-h-[44px] sm:h-auto px-3 sm:py-2.5 rounded-xl text-sm font-medium outline-none transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              <option value="all">All Types</option>
              {Object.entries(TX_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="flex-1 sm:flex-initial h-11 min-h-[44px] sm:h-auto px-3 sm:py-2.5 rounded-xl text-sm font-medium outline-none transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {isFiltering && (
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); }}
              className="h-11 min-h-[44px] sm:h-auto px-3 sm:py-2.5 rounded-xl text-xs font-semibold transition-colors hover:opacity-85 cursor-pointer flex items-center justify-center"
              style={{
                backgroundColor: 'var(--surface-3)',
                color: 'var(--text)',
                border: '1.5px solid var(--border)',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div
          className="py-12 flex flex-col items-center justify-center rounded-2xl text-center p-4"
          style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--border)' }}
        >
          <Filter size={32} style={{ color: 'var(--text-subtle)' }} className="mb-2" />
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            No transactions match your search
          </p>
          <p className="text-xs mt-1 mb-3" style={{ color: 'var(--text-muted)' }}>
            Try adjusting your search terms or filter selection.
          </p>
          <button
            onClick={() => { setSearch(''); setTypeFilter('all'); }}
            className="text-xs px-3 py-1.5 rounded-lg text-sky-500 hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ date, txs }) => (
            <div key={date}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
                {date}
              </h3>
              <div className="flex flex-col gap-2">
                {txs.map((tx) => <TxCard key={tx.id} tx={tx} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
