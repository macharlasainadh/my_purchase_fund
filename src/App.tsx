import React, { lazy, Suspense, useEffect, useState } from 'react';
import { usePurchaseStore } from './store/usePurchaseStore';
import { LandingPage } from './components/Landing/LandingPage';

const PlannerView = lazy(() => import('./PlannerView'));

export default function App() {
  const darkMode = usePurchaseStore((state) => state.darkMode);
  const [currentView, setCurrentView] = useState<'landing' | 'app'>(() => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return hash === '#app' || path === '/app' || window.location.search.includes('app=true')
      ? 'app'
      : 'landing';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#app') setCurrentView('app');
      else if (hash === '#landing' || hash === '' || hash === '#/') setCurrentView('landing');
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function handleOpenApp() {
    setCurrentView('app');
    window.location.hash = '#app';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return currentView === 'landing'
    ? <LandingPage onOpenApp={handleOpenApp} />
    : (
      <Suspense fallback={<div className="min-h-screen" role="status" aria-label="Loading planner" style={{ backgroundColor: 'var(--bg)' }} />}>
        <PlannerView />
      </Suspense>
    );
}
