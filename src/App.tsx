import React, { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sun, Wallet } from 'lucide-react';
import { usePurchaseStore } from './store/usePurchaseStore';
import { LandingPage } from './components/Landing/LandingPage';
import { PaymentTracker } from './platform/PaymentTracker';
import { applyTheme, getLastModule, getSidebarCollapsed, getThemePreference, setLastModule, setSidebarCollapsed, setThemePreference, type PlatformModule, type ThemePreference } from './platform/preferences';
const PlannerView = lazy(() => import('./PlannerView'));
type Route = { view: 'landing' } | { view: 'app'; module: PlatformModule; page: string } | { view: 'settings' };

function readRoute(): Route {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#landing' || hash === '#/') return { view: 'landing' };
  if (window.location.pathname.toLowerCase() === '/app' || window.location.search.includes('app=true')) return { view: 'app', module: getLastModule(), page: 'overview' };
  if (hash === '#app' || hash === '#app/' || hash === '#app/purchase-fund') return { view: 'app', module: 'purchase-fund', page: 'overview' };
  if (hash.startsWith('#app/payment-tracker')) {
    const [, , pagePart, detailId] = hash.split('/');
    const page = pagePart === 'detail' && detailId ? `detail-${detailId}` : pagePart || 'overview';
    const valid = ['overview','plans','timeline','history','categories','settings'];
    return { view: 'app', module: 'payment-tracker', page: valid.includes(page) || page.startsWith('detail-') ? page : 'overview' };
  }
  if (hash === '#app/settings') return { view: 'settings' };
  if (hash.startsWith('#app/')) return { view: 'app', module: 'purchase-fund', page: 'overview' };
  if (!hash && window.location.search.includes('app=true')) return { view: 'app', module: getLastModule(), page: 'overview' };
  return { view: 'landing' };
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute);
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference);
  const [sidebarCollapsed, setCollapsed] = useState(getSidebarCollapsed);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const purchaseDarkMode = usePurchaseStore(state => state.darkMode);
  useEffect(() => {
    applyTheme(theme);
    const effectiveDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    usePurchaseStore.setState({ darkMode: effectiveDark });
  }, [theme]);
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => { if (theme === 'system') {
      applyTheme('system');
      usePurchaseStore.setState({ darkMode: query.matches });
    } };
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
      const next = readRoute(); setRoute(next);
      if (next.view === 'app') setLastModule(next.module);
    };
    window.addEventListener('hashchange', onChange); window.addEventListener('popstate', onChange);
    return () => { window.removeEventListener('hashchange', onChange); window.removeEventListener('popstate', onChange); };
  }, []);
  useEffect(() => { if (route.view === 'app') setLastModule(route.module); }, [route]);
  function navigate(hash: string) { if (window.location.hash !== hash) window.location.hash = hash; else setRoute(readRoute()); }
  function selectModule(module: PlatformModule) { setLastModule(module); navigate(module === 'payment-tracker' ? '#app/payment-tracker' : '#app/purchase-fund'); }
  function chooseTheme(value: ThemePreference) { setTheme(value); setThemePreference(value); }
  function toggleSidebar() { const next = !sidebarCollapsed; setCollapsed(next); setSidebarCollapsed(next); }

  if (route.view === 'landing') return <LandingPage onOpenApp={() => navigate('#app/purchase-fund')} />;
  const activeModule = route.view === 'app' ? route.module : getLastModule();
  return <div className="platform-shell" data-module={activeModule}>
    <aside className="platform-sidebar" data-collapsed={sidebarCollapsed}>
      <a className="platform-brand" href="#app/purchase-fund" title="My Purchase Fund — Personal finance"><span className="platform-logo"><Wallet size={20}/></span><span><b>My Purchase Fund</b><small>Personal finance</small></span></a>
      <button className="platform-collapse" onClick={toggleSidebar} aria-expanded={!sidebarCollapsed} aria-label={sidebarCollapsed?'Expand application sidebar':'Collapse application sidebar'} title={sidebarCollapsed?'Expand sidebar':'Collapse sidebar'}>{sidebarCollapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button>
      <p className="platform-label">APPLICATIONS</p>
      <button className={`platform-module ${activeModule==='purchase-fund'?'selected':''}`} onClick={()=>selectModule('purchase-fund')} aria-label="Purchase Fund" title={sidebarCollapsed?'Purchase Fund':undefined}><Wallet size={18}/><span>Purchase Fund</span></button>
      <button className={`platform-module ${activeModule==='payment-tracker'?'selected':''}`} onClick={()=>selectModule('payment-tracker')} aria-label="Payment Tracker" title={sidebarCollapsed?'Payment Tracker':undefined}><CreditCard size={18}/><span>Payment Tracker</span></button>
      <div className="platform-sidebar-bottom"><button className={`platform-module ${route.view==='settings'?'selected':''}`} onClick={()=>navigate('#app/settings')} aria-label="Global Settings" title={sidebarCollapsed?'Global Settings':undefined}><Settings size={18}/><span>Global Settings</span></button>
      <div className="theme-control-wrap">{sidebarCollapsed ? <><button className="theme-trigger" type="button" aria-label={`Appearance: ${theme[0].toUpperCase()+theme.slice(1)}`} title={`Appearance: ${theme[0].toUpperCase()+theme.slice(1)}`} aria-expanded={appearanceOpen} onClick={()=>setAppearanceOpen(open=>!open)}>{theme==='dark'?<Moon size={17}/>:<Sun size={17}/>}</button>{appearanceOpen&&<div className="theme-popover" role="group" aria-label="Appearance"><b>Appearance</b>{(['system','light','dark'] as ThemePreference[]).map(value=><button key={value} type="button" aria-pressed={theme===value} onClick={()=>{chooseTheme(value);setAppearanceOpen(false);}}>{value==='system'?'System':value[0].toUpperCase()+value.slice(1)}</button>)}</div>}</> : <label className="theme-control"><span>Appearance</span><select value={theme} onChange={e=>chooseTheme(e.target.value as ThemePreference)} aria-label="Theme preference"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select><span className="theme-icon">{theme==='dark'?<Moon size={16}/>:<Sun size={16}/>}</span></label>}</div></div>
      <div className="platform-local-note"><span className="platform-local-dot"/> Your data stays on this device</div>
    </aside>
    <div className="platform-content">
      {route.view==='settings' ? <main className="platform-settings"><button className="platform-back" onClick={()=>selectModule(activeModule)}><ArrowLeft size={16}/> Back to {activeModule==='purchase-fund'?'Purchase Fund':'Payment Tracker'}</button><p className="platform-label">PLATFORM</p><h1>Global Settings</h1><p>Choose the appearance used across your finance workspace.</p><div className="platform-settings-card"><h2>Theme preference</h2><p>System follows your device setting. Your choice is saved in this browser.</p><div className="theme-options">{(['system','light','dark'] as ThemePreference[]).map(t=><button key={t} aria-pressed={theme===t} onClick={()=>chooseTheme(t)}>{t==='system'?'System':t[0].toUpperCase()+t.slice(1)}</button>)}</div></div></main> : route.module==='payment-tracker'
        ? <PaymentTracker page={route.page} onNavigate={page=>navigate(page==='overview'?'#app/payment-tracker':page.startsWith('detail-')?`#app/payment-tracker/detail/${page.slice(7)}`:`#app/payment-tracker/${page}`)}/>
        : <Suspense fallback={<div className="min-h-screen" role="status" aria-label="Loading planner" style={{backgroundColor:'var(--bg)'}}/>}><div className="purchase-module" data-legacy-theme={purchaseDarkMode}><PlannerView/></div></Suspense>}
    </div>
  </div>;
}
