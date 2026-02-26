import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply saved theme before first render to prevent flash of wrong theme
try {
  const raw = localStorage.getItem('periodSafe_userSettings');
  if (raw) {
    const s = JSON.parse(raw);
    if (s.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
} catch {
  // ignore parse errors; default theme (light) applies
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
