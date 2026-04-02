import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './app/app'
import { AuthProvider } from './features/auth/auth-context'
import { AutoThemeSync } from './features/theme/auto-theme-sync'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AutoThemeSync />
    <AuthProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AuthProvider>
  </StrictMode>,
)
