import React, { useState, useRef, useEffect } from 'react';
import {
  PlusCircle, Package, ArrowRightLeft, RefreshCw, Equal,
  Moon, Sun, Wallet, History, ShoppingBag, Target,
  ChevronDown, Pencil, Check, X as XIcon, MoreHorizontal,
  Database, Layers, ShoppingCart, AlertCircle, HardDrive,
} from 'lucide-react';
import { usePurchaseStore, selectFundSummary } from '../../store/usePurchaseStore';
import { useModalStore } from '../../store/useModalStore';
import { formatCurrency, formatPercent, rupeesToPaise, paiseToRupees } from '../../utils/currency';

// ─── Dropdown "More Actions" menu ────────────────────────────────────────────

function MoreMenu({
  onMove, onRedistribute, onDistribute, onDataManagement,
}: {
  onMove: () => void;
  onRedistribute: () => void;
  onDistribute: () => void;
  onDataManagement: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const item = (label: string, icon: React.ReactNode, fn: () => void) => (
    <button
      key={label}
      onClick={() => { fn(); setOpen(false); }}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:opacity-80"
      style={{ color: 'var(--text)' }}
    >
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{ border: '1px solid var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
      >
        <MoreHorizontal size={15} />
        <span className="hidden sm:inline">More</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden shadow-lg z-50"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="px-4 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-wider"
             style={{ color: 'var(--text-muted)' }}>
            Fund Actions
          </p>
          {item('Move Money', <ArrowRightLeft size={14} />, onMove)}
          {item('Redistribute %', <RefreshCw size={14} />, onRedistribute)}
          {item('Distribute Equally', <Equal size={14} />, onDistribute)}
          <div className="mx-3 my-1.5" style={{ borderTop: '1px solid var(--border)' }} />
          <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Data</p>
          {item('Backup & Export', <HardDrive size={14} />, onDataManagement)}
        </div>
      )}
    </div>
  );
}

// ─── Inline-editable fund amount ─────────────────────────────────────────────

function EditableFundValue({ totalFundPaise, minRequiredPaise, color, onSave }: {
  totalFundPaise: number;
  minRequiredPaise: number;
  color: string;
  onSave: (paise: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function start() {
    setVal(String(paiseToRupees(totalFundPaise)));
    setErr('');
    setEditing(true);
    setTimeout(() => { inputRef.current?.select(); }, 10);
  }

  function commit() {
    const newPaise = rupeesToPaise(parseFloat(val) || 0);
    if (newPaise < minRequiredPaise) {
      setErr(`Min ${formatCurrency(minRequiredPaise)}`);
      return;
    }
    onSave(newPaise);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold" style={{ color }}>₹</span>
          <input
            ref={inputRef}
            type="number"
            value={val}
            onChange={(e) => { setVal(e.target.value); setErr(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            className="w-24 text-sm font-bold bg-transparent outline-none"
            style={{ color }}
          />
          <button onClick={commit} className="p-0.5 rounded text-emerald-500 hover:bg-emerald-100/20" title="Save"><Check size={12} /></button>
          <button onClick={() => setEditing(false)} className="p-0.5 rounded text-rose-500 hover:bg-rose-100/20" title="Cancel"><XIcon size={12} /></button>
        </div>
        {err && <p className="text-xs text-rose-500">{err}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group/val">
      <span className="text-base font-bold" style={{ color }}>{formatCurrency(totalFundPaise)}</span>
      <button
        onClick={start}
        className="opacity-70 sm:opacity-0 sm:group-hover/val:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
        style={{ color }}
        title="Edit total fund"
      >
        <Pencil size={11} />
      </button>
    </div>
  );
}

// ─── Mini ring progress ───────────────────────────────────────────────────────
function MiniRing({ pct, color }: { pct: number; color: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" className="flex-shrink-0">
      <circle cx={22} cy={22} r={r} fill="none" stroke="var(--bar-track)" strokeWidth={4} />
      <circle
        cx={22} cy={22} r={r} fill="none"
        stroke={color} strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x={22} y={26} textAnchor="middle" fontSize={9} fontWeight="bold" fill={color}>
        {pct >= 100 ? '100%' : `${pct.toFixed(0)}%`}
      </text>
    </svg>
  );
}

// ─── Single summary card ──────────────────────────────────────────────────────
interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  sub: string;
  color: string;
  bg: string;
  customValue?: React.ReactNode;
}

function SummaryCard({ icon, label, value, sub, color, bg, customValue }: SummaryCardProps) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-3 rounded-2xl min-w-0"
      style={{ backgroundColor: bg, border: `1.5px solid ${color}28` }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}22` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate" style={{ color, opacity: 0.8 }}>{label}</p>
        {customValue ?? (
          <p className="text-sm font-bold leading-tight truncate" style={{ color }}>{value}</p>
        )}
        <p className="text-xs leading-tight mt-0.5 truncate" style={{ color, opacity: 0.6 }}>{sub}</p>
      </div>
    </div>
  );
}

// ─── Fund summary card grid ───────────────────────────────────────────────────
function FundSummaryCards({ summary, onSaveFund }: {
  summary: ReturnType<typeof selectFundSummary>;
  onSaveFund: (paise: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {/* Total Fund — editable */}
      <div
        className="flex items-center gap-2.5 px-3 py-3 rounded-2xl min-w-0 group/fund"
        style={{ backgroundColor: 'var(--accent-fund-bg)', border: '1.5px solid color-mix(in srgb, var(--accent-fund) 25%, transparent)' }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ backgroundColor: 'color-mix(in srgb, var(--accent-fund) 15%, transparent)' }}>
          <Wallet size={16} style={{ color: 'var(--accent-fund)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate" style={{ color: 'var(--accent-fund)', opacity: 0.8 }}>Total Fund</p>
          <EditableFundValue
            totalFundPaise={summary.totalFundPaise}
            minRequiredPaise={summary.totalCommittedPaise}
            color="var(--accent-fund)"
            onSave={onSaveFund}
          />
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--accent-fund)', opacity: 0.6 }}>Total amount added</p>
        </div>
      </div>

      {/* Allocated */}
      <SummaryCard
        icon={<Database size={16} style={{ color: 'var(--accent-allocated)' }} />}
        label="Allocated"
        value={formatCurrency(summary.totalAllocatedPaise)}
        sub="Assigned to products"
        color="var(--accent-allocated)"
        bg="var(--accent-allocated-bg)"
      />

      {/* Unallocated */}
      <SummaryCard
        icon={<Layers size={16} style={{ color: 'var(--accent-free)' }} />}
        label="Unallocated (Free)"
        value={formatCurrency(summary.unallocatedPaise)}
        sub="Available to assign"
        color="var(--accent-free)"
        bg="var(--accent-free-bg)"
      />

      {/* Total Required */}
      <SummaryCard
        icon={<ShoppingCart size={16} style={{ color: 'var(--accent-required)' }} />}
        label="Total Required"
        value={formatCurrency(summary.totalRequiredPaise)}
        sub="Cost of all products"
        color="var(--accent-required)"
        bg="var(--accent-required-bg)"
      />

      {/* Still Needed */}
      <SummaryCard
        icon={<AlertCircle size={16} style={{ color: summary.remainingRequiredPaise > 0 ? 'var(--accent-needed)' : 'var(--accent-free)' }} />}
        label="Still Needed"
        value={formatCurrency(summary.remainingRequiredPaise)}
        sub="Remaining to reach goals"
        color={summary.remainingRequiredPaise > 0 ? 'var(--accent-needed)' : 'var(--accent-free)'}
        bg={summary.remainingRequiredPaise > 0 ? 'var(--accent-needed-bg)' : 'var(--accent-free-bg)'}
      />

      {/* Overall Progress — ring */}
      <div
        className="flex items-center gap-2.5 px-3 py-3 rounded-2xl min-w-0"
        style={{ backgroundColor: 'var(--accent-progress-bg)', border: '1.5px solid color-mix(in srgb, var(--accent-progress) 25%, transparent)' }}
      >
        <MiniRing pct={summary.overallProgressPercent} color="var(--accent-progress)" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate" style={{ color: 'var(--accent-progress)', opacity: 0.8 }}>Overall Progress</p>
          <p className="text-sm font-bold leading-tight" style={{ color: 'var(--accent-progress)' }}>
            {formatPercent(summary.overallProgressPercent)}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--accent-progress)', opacity: 0.6 }}>Toward your purchase goals</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Header ─────────────────────────────────────────────────────────────

export function DashboardHeader() {
  const store = usePurchaseStore();
  const { darkMode, setDarkMode, setActiveTab, activeTab, setTotalFund } = store;
  const { openAddMoney, openProductForm, openMoveMoney, openRedistribute, openEqualDistribute, openDataManagement } = useModalStore();
  const summary = selectFundSummary(store);

  const tabs = [
    { id: 'products'  as const, label: 'Products',  icon: Package   },
    { id: 'goals'     as const, label: 'Goals',     icon: Target    },
    { id: 'history'   as const, label: 'History',   icon: History   },
    { id: 'purchased' as const, label: 'Purchased', icon: ShoppingBag },
  ];

  return (
    <header
      className="md:sticky md:top-0 z-30"
      style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 8px 0 rgba(0,0,0,0.07)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ══════════════════════════════════════════════════════════════════
            MOBILE APP VIEW (Visible only on < md screens)
            Native-style layout: App bar -> Action bar -> Dashboard Cards
           ══════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden flex flex-col gap-3.5 pt-3 pb-3">
          {/* Row 1: App Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Wallet size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight" style={{ color: 'var(--text)' }}>
                  My Purchase Fund
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Personal planner
                </p>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
              style={{
                color: 'var(--text-muted)',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
              }}
              title={darkMode ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* ON PRODUCTS TAB ONLY: Quick Actions & Financial Dashboard */}
          {activeTab === 'products' && (
            <>
              {/* Row 2: Action Buttons (Touch targets >= 44px) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAddMoney()}
                  className="flex-1 h-11 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <PlusCircle size={16} />
                  <span>Add Money</span>
                </button>

                <button
                  onClick={() => openProductForm()}
                  className="h-11 px-2.5 sm:px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                  style={{
                    border: '1.5px solid var(--border)',
                    color: 'var(--text)',
                    backgroundColor: 'var(--surface-2)',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>+ Add Product</span>
                </button>

                <MoreMenu
                  onMove={openMoveMoney}
                  onRedistribute={openRedistribute}
                  onDistribute={openEqualDistribute}
                  onDataManagement={openDataManagement}
                />
              </div>

          {/* Mobile Dashboard: Hierarchical Financial Overview */}
          <div className="flex flex-col gap-2.5">
            {/* Card 1: Total Fund (Prominent Hero Card) */}
            <div
              className="rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm"
              style={{
                backgroundColor: 'var(--accent-fund-bg)',
                border: '1.5px solid color-mix(in srgb, var(--accent-fund) 30%, transparent)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent-fund) 20%, transparent)' }}
                  >
                    <Wallet size={15} style={{ color: 'var(--accent-fund)' }} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-fund)' }}>
                    Total Fund
                  </span>
                </div>
                <EditableFundValue
                  totalFundPaise={summary.totalFundPaise}
                  minRequiredPaise={summary.totalCommittedPaise}
                  color="var(--accent-fund)"
                  onSave={setTotalFund}
                />
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--accent-fund)', opacity: 0.8 }}>
                Total amount added
              </p>
            </div>

            {/* Row 2: Allocated & Unallocated */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Allocated */}
              <div
                className="rounded-2xl p-3.5 flex flex-col justify-between min-h-[92px]"
                style={{
                  backgroundColor: 'var(--accent-allocated-bg)',
                  border: '1.5px solid color-mix(in srgb, var(--accent-allocated) 25%, transparent)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Database size={14} style={{ color: 'var(--accent-allocated)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent-allocated)' }}>
                    Allocated
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold leading-tight" style={{ color: 'var(--accent-allocated)' }}>
                    {formatCurrency(summary.totalAllocatedPaise)}
                  </p>
                  <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--accent-allocated)', opacity: 0.8 }}>
                    To products
                  </p>
                </div>
              </div>

              {/* Unallocated */}
              <div
                className="rounded-2xl p-3.5 flex flex-col justify-between min-h-[92px]"
                style={{
                  backgroundColor: 'var(--accent-free-bg)',
                  border: '1.5px solid color-mix(in srgb, var(--accent-free) 25%, transparent)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Layers size={14} style={{ color: 'var(--accent-free)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent-free)' }}>
                    Unallocated
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold leading-tight" style={{ color: 'var(--accent-free)' }}>
                    {formatCurrency(summary.unallocatedPaise)}
                  </p>
                  <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--accent-free)', opacity: 0.8 }}>
                    Available
                  </p>
                </div>
              </div>
            </div>

            {/* Row 3: Required & Still Needed */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Total Required */}
              <div
                className="rounded-2xl p-3.5 flex flex-col justify-between min-h-[92px]"
                style={{
                  backgroundColor: 'var(--accent-required-bg)',
                  border: '1.5px solid color-mix(in srgb, var(--accent-required) 25%, transparent)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <ShoppingCart size={14} style={{ color: 'var(--accent-required)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent-required)' }}>
                    Required
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold leading-tight" style={{ color: 'var(--accent-required)' }}>
                    {formatCurrency(summary.totalRequiredPaise)}
                  </p>
                  <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--accent-required)', opacity: 0.8 }}>
                    Cost of all products
                  </p>
                </div>
              </div>

              {/* Still Needed */}
              <div
                className="rounded-2xl p-3.5 flex flex-col justify-between min-h-[92px]"
                style={{
                  backgroundColor: summary.remainingRequiredPaise > 0 ? 'var(--accent-needed-bg)' : 'var(--accent-free-bg)',
                  border: `1.5px solid color-mix(in srgb, ${summary.remainingRequiredPaise > 0 ? 'var(--accent-needed)' : 'var(--accent-free)'} 25%, transparent)`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={14} style={{ color: summary.remainingRequiredPaise > 0 ? 'var(--accent-needed)' : 'var(--accent-free)' }} />
                  <span className="text-xs font-semibold" style={{ color: summary.remainingRequiredPaise > 0 ? 'var(--accent-needed)' : 'var(--accent-free)' }}>
                    Still Needed
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold leading-tight" style={{ color: summary.remainingRequiredPaise > 0 ? 'var(--accent-needed)' : 'var(--accent-free)' }}>
                    {formatCurrency(summary.remainingRequiredPaise)}
                  </p>
                  <p className="text-[11px] leading-tight mt-0.5" style={{ color: summary.remainingRequiredPaise > 0 ? 'var(--accent-needed)' : 'var(--accent-free)', opacity: 0.8 }}>
                    Remaining to goal
                  </p>
                </div>
              </div>
            </div>

            {/* Row 4: Overall Progress (Dedicated App Section) */}
            <div
              className="rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
              style={{
                backgroundColor: 'var(--accent-progress-bg)',
                border: '1.5px solid color-mix(in srgb, var(--accent-progress) 25%, transparent)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--accent-progress)' }}>
                  Overall Progress
                </span>
                <span className="text-sm font-black" style={{ color: 'var(--accent-progress)' }}>
                  {formatPercent(summary.overallProgressPercent)}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bar-track, rgba(0,0,0,0.08))' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(summary.overallProgressPercent, 100)}%`,
                    backgroundColor: 'var(--accent-progress)',
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--accent-progress)', opacity: 0.8 }}>
                Toward all purchase goals
              </p>
            </div>
          </div>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            DESKTOP HEADER (Visible only on md: and larger screens)
            Completely unchanged desktop layout
           ══════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block">
          {/* ── Row 1: Brand + Actions ─────────────── */}
          <div className="flex items-center justify-between py-2.5 gap-2">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <Wallet size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text)' }}>My Purchase Fund</p>
                <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>Personal planner</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAddMoney()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>Add Money</span>
              </button>

              <button
                onClick={() => openProductForm()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{ border: '1px solid var(--border)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}
              >
                <Package size={14} />
                <span>Add Product</span>
              </button>

              <MoreMenu
                onMove={openMoveMoney}
                onRedistribute={openRedistribute}
                onDistribute={openEqualDistribute}
                onDataManagement={openDataManagement}
              />

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>

          {/* ── Row 2: Summary cards ───────────────────── */}
          <div className="pb-2">
            <FundSummaryCards summary={summary} onSaveFund={setTotalFund} />
          </div>

          {/* ── Row 3: Tabs ───────────────────────── */}
          <div className="flex gap-0 border-b" style={{ borderColor: 'var(--border)' }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer"
                  style={{
                    borderColor: active ? '#6366f1' : 'transparent',
                    color: active ? '#6366f1' : 'var(--text-muted)',
                    backgroundColor: active ? 'var(--accent-progress-bg)' : 'transparent',
                  }}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
}
