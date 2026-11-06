import React, { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowLeftRight, CalendarDays, CreditCard, FileClock, Layers3, Moon, Package, PanelLeftClose, PanelLeftOpen, Settings2, ShoppingBag, Sun, Tag, Target, WalletCards } from 'lucide-react';
import { LandingPage } from './components/Landing/LandingPage';
import { PaymentTracker } from './platform/PaymentTracker';
import { usePurchaseStore } from './store/usePurchaseStore';
import { applyTheme, getLastModule, getSidebarCollapsed, getThemePreference, setLastModule, setSidebarCollapsed, setThemePreference, type PlatformModule, type ThemePreference } from './platform/preferences';
const PlannerView = lazy(() => import('./PlannerView'));
type Route = { view: 'landing' } | { view: 'app'; module: PlatformModule; page: string };

const paymentNavigation = [
  ['overview','Overview',WalletCards], ['plans','My Plans',Layers3], ['timeline','Timeline',CalendarDays],
  ['history','History',FileClock], ['categories','Categories',Tag], ['settings','Settings',Settings2],
] as const;
const purchaseNavigation = [
  ['products','Products',Package], ['goals','Goals',Target], ['history','History',FileClock], ['purchased','Purchased',ShoppingBag],
] as const;
const paymentPages: Set<string> = new Set(paymentNavigation.map(([page])=>page));

function readRoute(): Route {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#landing' || hash === '#/') return { view: 'landing' };
  if (window.location.pathname.toLowerCase() === '/app' || window.location.search.includes('app=true')) return { view: 'app', module: getLastModule(), page: 'overview' };
  if (hash === '#app' || hash === '#app/' || hash === '#app/purchase-fund') return { view: 'app', module: 'purchase-fund', page: 'overview' };
  if (hash.startsWith('#app/payment-tracker')) {
    const [, , pagePart, detailId] = hash.split('/');
    const page = pagePart === 'detail' && detailId ? `detail-${detailId}` : pagePart || 'overview';
    return { view: 'app', module: 'payment-tracker', page: paymentPages.has(page) || page.startsWith('detail-') ? page : 'overview' };
  }
  if (hash.startsWith('#app/')) return { view: 'app', module: 'purchase-fund', page: 'overview' };
  if (!hash && window.location.search.includes('app=true')) return { view: 'app', module: getLastModule(), page: 'overview' };
  return { view: 'landing' };
}

function paymentHash(page: string) {
  return page === 'overview' ? '#app/payment-tracker' : page.startsWith('detail-') ? `#app/payment-tracker/detail/${page.slice(7)}` : `#app/payment-tracker/${page}`;
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute);
  const [lastPaymentPage, setLastPaymentPage] = useState(() => {
    const initial = readRoute();
    return initial.view === 'app' && initial.module === 'payment-tracker' ? initial.page : 'overview';
  });
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [sidebarCollapsed, setCollapsed] = useState(getSidebarCollapsed);
  const purchaseTab = usePurchaseStore(state => state.activeTab);
  const setPurchaseTab = usePurchaseStore(state => state.setActiveTab);
  const darkMode = theme === 'dark' || (theme === 'system' && systemDark);
  const activeModule = route.view === 'app' ? route.module : getLastModule();

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => { setSystemDark(query.matches); if (theme === 'system') applyTheme('system'); };
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, [theme]);
  useEffect(() => {
    const onThemeChange = () => setTheme(getThemePreference());
    window.addEventListener('platform-theme-change', onThemeChange);
    return () => window.removeEventListener('platform-theme-change', onThemeChange);
  }, []);
  useEffect(() => {
    const onChange = () => {
      const next = readRoute();
      setRoute(next);
      if (next.view === 'app') {
        setLastModule(next.module);
        if (next.module === 'payment-tracker') setLastPaymentPage(next.page);
      }
    };
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => { window.removeEventListener('hashchange', onChange); window.removeEventListener('popstate', onChange); };
  }, []);
  useEffect(() => {
    if (route.view === 'app') {
      setLastModule(route.module);
      if (route.module === 'payment-tracker') setLastPaymentPage(route.page);
    }
  }, [route]);

  function navigate(hash: string) { if (window.location.hash !== hash) window.location.hash = hash; else setRoute(readRoute()); }
  function selectModule(module: PlatformModule) {
    setLastModule(module);
    navigate(module === 'payment-tracker' ? paymentHash(lastPaymentPage) : '#app/purchase-fund');
  }
  function chooseTheme(value: ThemePreference) { setTheme(value); setThemePreference(value); }
  function toggleTheme() { chooseTheme(darkMode ? 'light' : 'dark'); }
  function toggleSidebar() { const next = !sidebarCollapsed; setCollapsed(next); setSidebarCollapsed(next); }
  function openPaymentPage(page: string) { navigate(paymentHash(page)); }

  if (route.view === 'landing') return <LandingPage darkMode={darkMode} onOpenApp={() => navigate('#app/purchase-fund')} />;
  const switchModule: PlatformModule = activeModule === 'purchase-fund' ? 'payment-tracker' : 'purchase-fund';
  const moduleName = activeModule === 'purchase-fund' ? 'Purchase Fund' : 'Payment Tracker';
  const ActiveIcon = activeModule === 'purchase-fund' ? WalletCards : CreditCard;
  const pageNavigation = activeModule === 'purchase-fund' ? purchaseNavigation : paymentNavigation;
  const routePage = route.view === 'app' ? route.page : 'overview';
  const currentPage = activeModule === 'purchase-fund' ? purchaseTab : routePage.startsWith('detail-') ? 'plans' : routePage;

  return <div className="platform-shell" data-module={activeModule}>
    <header className="platform-mobile-header">
      <div className={`platform-mobile-active ${activeModule}`}><ActiveIcon size={19}/><span>{moduleName}</span></div>
      <button className={`platform-mobile-switch ${switchModule}`} type="button" onClick={()=>selectModule(switchModule)} aria-label={`Switch to ${switchModule==='purchase-fund'?'Purchase Fund':'Payment Tracker'}`} title={`Switch to ${switchModule==='purchase-fund'?'Purchase Fund':'Payment Tracker'}`}><ArrowLeftRight size={16}/><span>{switchModule==='purchase-fund'?'Purchase Fund':'Payment Tracker'}</span></button>
      <button className="theme-toggle mobile-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${darkMode?'light':'dark'} mode`} title={`Switch to ${darkMode?'light':'dark'} mode`} aria-pressed={darkMode}>{darkMode?<Sun size={18}/>:<Moon size={18}/>}</button>
    </header>
    <aside className="platform-sidebar" data-collapsed={sidebarCollapsed}>
      <a className="platform-brand" href="#app/purchase-fund" title="MITRA — Purchase, Pay, Plan"><img src="/mitra-mark.svg" alt=""/><span><b>MITRA</b><small>Purchase • Pay • Plan</small></span></a>
      <button className="platform-collapse" onClick={toggleSidebar} aria-expanded={!sidebarCollapsed} aria-label={sidebarCollapsed?'Expand application sidebar':'Collapse application sidebar'} title={sidebarCollapsed?'Expand sidebar':'Collapse sidebar'}>{sidebarCollapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button>
      <p className="platform-label">APPLICATIONS</p>
      <div className="platform-app-switcher" role="group" aria-label="Applications">
        <button className={`platform-module ${activeModule==='purchase-fund'?'selected':''}`} onClick={()=>selectModule('purchase-fund')} aria-label="Purchase Fund" aria-pressed={activeModule==='purchase-fund'} title={sidebarCollapsed?'Purchase Fund':undefined}><WalletCards size={18}/><span>Purchase Fund</span></button>
        <button className={`platform-module ${activeModule==='payment-tracker'?'selected':''}`} onClick={()=>selectModule('payment-tracker')} aria-label="Payment Tracker" aria-pressed={activeModule==='payment-tracker'} title={sidebarCollapsed?'Payment Tracker':undefined}><CreditCard size={18}/><span>Payment Tracker</span></button>
      </div>
      <div className="platform-sidebar-navigation">
        <p className="platform-label">{moduleName.toUpperCase()}</p>
        <nav aria-label={`${moduleName} navigation`}>
          {pageNavigation.map(([page,label,Icon])=><button key={page} className={`platform-module platform-page-link ${currentPage===page?'selected':''}`} onClick={()=>activeModule==='purchase-fund'?setPurchaseTab(page as typeof purchaseTab):openPaymentPage(page)} aria-current={currentPage===page?'page':undefined} title={sidebarCollapsed?label:undefined}><Icon size={18}/><span>{label}</span></button>)}
        </nav>
      </div>
      <div className="platform-sidebar-bottom"><div className="theme-control-wrap"><span className="theme-label">Appearance</span><button className="theme-toggle" type="button" aria-label={`Switch to ${darkMode?'light':'dark'} mode`} title={`Switch to ${darkMode?'light':'dark'} mode`} aria-pressed={darkMode} onClick={toggleTheme}>{darkMode?<Sun size={17}/>:<Moon size={17}/>}<span>{darkMode?'Dark':'Light'}</span></button></div></div>
      <div className="platform-local-note"><span className="platform-local-dot"/> Your data stays on this device</div>
    </aside>
    <div className="platform-content">
      {route.module==='payment-tracker'
        ? <PaymentTracker page={route.page} onNavigate={openPaymentPage}/>
        : <Suspense fallback={<div className="min-h-screen" role="status" aria-label="Loading MITRA" style={{backgroundColor:'var(--bg)'}}/>}><div className="purchase-module"><PlannerView darkMode={darkMode}/></div></Suspense>}
    </div>
  </div>;
}
