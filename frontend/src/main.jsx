import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initColorMode } from './lib/colorMode'
import App from './App.jsx'

// Set light/dark mode before first paint to avoid a flash of the wrong theme.
initColorMode()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
