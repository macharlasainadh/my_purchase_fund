import React, { useState, useEffect } from 'react';
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
import { LandingPage } from './components/Landing/LandingPage';

export default function App() {
  const { darkMode, activeTab, setActiveTab } = usePurchaseStore();
  const { confirmOpen, confirmTitle, confirmMessage, confirmOnConfirm, closeConfirm } = useModalStore();

  const [currentView, setCurrentView] = React.useState<'landing' | 'app'>(() => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (hash === '#app' || path === '/app' || window.location.search.includes('app=true')) {
      return 'app';
    }
    return 'landing';
  });

  const mobileTabs = [
    { id: 'products'  as const, label: 'Products',  icon: Package   },
    { id: 'goals'     as const, label: 'Goals',     icon: Target    },
    { id: 'history'   as const, label: 'History',   icon: History   },
    { id: 'purchased' as const, label: 'Purchased', icon: ShoppingBag },
  ];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#app') {
        setCurrentView('app');
      } else if (hash === '#landing' || hash === '' || hash === '#/') {
        setCurrentView('landing');
      }
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function handleOpenApp() {
    setCurrentView('app');
    window.location.hash = '#app';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (currentView === 'landing') {
    return <LandingPage onOpenApp={handleOpenApp} />;
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'dark' : ''}`}
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-12">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'products'  && <ProductGrid />}
          {activeTab === 'goals'     && <GoalsSection />}
          {activeTab === 'history'   && <TransactionHistory />}
          {activeTab === 'purchased' && <PurchasedSection />}
        </div>
      </main>

      {/* ── Native-Style Mobile Bottom Navigation Bar (md:hidden) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-1.5 flex items-center justify-around border-t shadow-lg"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {mobileTabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer select-none"
              style={{
                color: active ? '#6366f1' : 'var(--text-muted)',
                backgroundColor: active ? 'var(--accent-progress-bg)' : 'transparent',
              }}
            >
              <Icon size={20} className={active ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
              <span className={`text-[11px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Global Modals */}
      <AddMoneyModal />
      <ProductFormModal />
      <MoveMoneyModal />
      <RedistributeModal />
      <EqualDistributeModal />
      <DataManagementModal />
      <PurchaseModal />
      <GoalFormModal />
      <GoalContributeModal />

      {/* Confirm Dialog */}
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

      {/* Undo Toast — always mounted, shows when undoLabel is set */}
      <UndoToast />
    </div>
  );
}
