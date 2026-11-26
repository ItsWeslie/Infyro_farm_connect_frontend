import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TooltipProvider } from './components/ui/tooltip.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ConfirmDialogProvider } from './context/ConfirmDialogContext.jsx'

createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <ConfirmDialogProvider>
          <App />
        </ConfirmDialogProvider>
      </TooltipProvider>
    </AuthProvider>
)
