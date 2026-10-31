import React, { useEffect, useState } from 'react';
import { Package, Target, History, ShoppingBag } from 'lucide-react';
import { usePurchaseStore } from './store/usePurchaseStore';
import { DashboardHeader } from './components/Dashboard/DashboardHeader';
import { ProductGrid } from './components/Products/ProductGrid';
import { GoalsSection } from './components/Goals/GoalsSection';
import { TransactionHistory } from './components/History/TransactionHistory';
import { PurchasedSection } from './components/Purchased/PurchasedSection';
import { AddMoneyModal } from './components/Modals/AddMoneyModal';
import { ProductFormModal } from './components/Products/ProductFormModal';
import { MoveMoneyModal } from './components/Modals/MoveMoneyModal';
import { RedistributeModal } from './components/Modals/RedistributeModal';
import { EqualDistributeModal } from './components/Modals/EqualDistributeModal';
import { DataManagementModal } from './components/Modals/DataManagementModal';
import { PurchaseModal } from './components/Modals/PurchaseModal';
import { GoalFormModal } from './components/Goals/GoalFormModal';
import { GoalContributeModal } from './components/Goals/GoalContributeModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { UndoToast } from './components/ui/UndoToast';
import { useModalStore } from './store/useModalStore';

export default function PlannerView() {
  const { darkMode, activeTab, setActiveTab } = usePurchaseStore();
  const { confirmOpen, confirmTitle, confirmMessage, confirmOnConfirm, closeConfirm } = useModalStore();

  const mobileTabs = [
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'goals' as const, label: 'Goals', icon: Target },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'purchased' as const, label: 'Purchased', icon: ShoppingBag },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`} style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <DashboardHeader />
      <StorageWarning />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-12">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'products' && <ProductGrid />}
          {activeTab === 'goals' && <GoalsSection />}
          {activeTab === 'history' && <TransactionHistory />}
          {activeTab === 'purchased' && <PurchasedSection />}
        </div>
      </main>

      <nav
        aria-label="Planner sections"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-1.5 flex items-center justify-around border-t shadow-lg"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', backdropFilter: 'blur(16px)' }}
      >
        {mobileTabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={active ? 'page' : undefined}
              className="flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer select-none"
              style={{ color: active ? '#6366f1' : 'var(--text-muted)', backgroundColor: active ? 'var(--accent-progress-bg)' : 'transparent' }}
            >
              <Icon size={20} className={active ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
              <span className={`text-[11px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </button>
          );
        })}
      </nav>

      <AddMoneyModal />
      <ProductFormModal />
      <MoveMoneyModal />
      <RedistributeModal />
      <EqualDistributeModal />
      <DataManagementModal />
      <PurchaseModal />
      <GoalFormModal />
      <GoalContributeModal />
      {confirmOpen && (
        <ConfirmDialog
          isOpen={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          onConfirm={() => { confirmOnConfirm?.(); closeConfirm(); }}
          onClose={closeConfirm}
          danger
        />
      )}
      <UndoToast />
    </div>
  );
}

function StorageWarning() {
  const [visible, setVisible] = useState(false);
  const openDataManagement = useModalStore((state) => state.openDataManagement);

  useEffect(() => {
    const showWarning = () => setVisible(true);
    window.addEventListener('mpf-storage-write-failed', showWarning);
    return () => window.removeEventListener('mpf-storage-write-failed', showWarning);
  }, []);

  if (!visible) return null;
  return (
    <div role="alert" className="mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        <p>Changes could not be saved in this browser. Export a backup before refreshing or closing the app.</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={openDataManagement} className="font-semibold underline underline-offset-2">Open backup tools</button>
          <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss storage warning" className="px-2 py-1">Dismiss</button>
        </div>
      </div>
    </div>
  );
}
