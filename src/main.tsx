import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { enforceFrameBusting, initProductionShield } from './lib/security.ts'

// Initialize client-side security shields
enforceFrameBusting()
initProductionShield()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

