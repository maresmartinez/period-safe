import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
// Apply saved theme before first render to prevent flash of wrong theme
try {
  const raw = localStorage.getItem('periodSafe_userSettings');
  if (raw) {
    const s = JSON.parse(raw) as { theme?: string };
    if (s.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
} catch {
  // ignore parse errors; default theme (light) applies
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
