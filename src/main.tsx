import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

const appBootSplash = document.getElementById('app-boot-splash');
if (appBootSplash && window.matchMedia('(display-mode: standalone)').matches) {
  window.setTimeout(() => {
    appBootSplash.setAttribute('data-closing', 'true');
    window.setTimeout(() => appBootSplash.remove(), 280);
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 480);
} else {
  appBootSplash?.remove();
}
