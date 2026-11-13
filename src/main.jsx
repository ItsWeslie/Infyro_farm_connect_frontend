import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ConfirmDialogProvider } from './context/ConfirmDialogContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ConfirmDialogProvider>
        <App />
      </ConfirmDialogProvider>
    </AuthProvider>
  </StrictMode>,
)
