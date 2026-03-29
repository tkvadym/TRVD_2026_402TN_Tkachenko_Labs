import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './styles/variables.css'
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.07)',
        },
        success: {
          iconTheme: { primary: '#4caf85', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#d95f5f', secondary: '#fff' },
        },
      }}
    />
  </StrictMode>,
)
