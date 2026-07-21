import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initColorMode } from './lib/colorMode'
import App from './App.jsx'

initColorMode()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
