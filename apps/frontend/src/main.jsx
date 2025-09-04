// Import React shim first to prevent AsyncMode errors
import './utils/react-shim.js'
// Initialize cache buster to handle old bundle issues
import './utils/cache-buster.js'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { I18nProvider } from './hooks/useI18n.jsx'
import { registerServiceWorker } from './utils/serviceWorker.js'
import { initializeMonitoring } from './services/monitoring.js'
import { initializeSecurity } from './utils/security.js'
import ErrorBoundary from './components/atoms/ErrorBoundary.jsx'

// Initialize monitoring, security, and error tracking
initializeMonitoring()
initializeSecurity()

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </HelmetProvider>
)

registerServiceWorker()
