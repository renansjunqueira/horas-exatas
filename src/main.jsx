import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

// AuthProvider envolve tudo para que useAuth() funcione em qualquer componente.
// AppProvider foi movido para dentro de App.jsx, envolvendo apenas as rotas protegidas,
// garantindo que o fetch de dados só ocorra com o usuário autenticado.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
