import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AdminRoute from './components/AdminRoute';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';
import AguardandoAprovacao from './pages/AguardandoAprovacao';
import AcessoNegado from './pages/AcessoNegado';

// Páginas protegidas (existentes)
import Projects from './pages/Projects';
import Team from './pages/Team';
import TimeLogs from './pages/TimeLogs';
import Dashboard from './pages/Dashboard';
import Aprovacoes from './pages/Aprovacoes';

function App() {
  return (
    <Routes>
      {/* ── Rotas públicas ── */}
      {/* PublicOnlyRoute redireciona usuários já logados de volta para o app */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
      </Route>

      {/* Telas de status — acessíveis sem estar no app principal */}
      <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />
      <Route path="/acesso-negado" element={<AcessoNegado />} />

      {/* ── Rotas protegidas ── */}
      {/* ProtectedRoute verifica: autenticado + aprovado */}
      {/* AppProvider só monta aqui, garantindo que os fetches ocorram com sessão ativa */}
      <Route element={<ProtectedRoute />}>
        <Route element={
          <AppProvider>
            <Layout />
          </AppProvider>
        }>
          <Route index element={<Navigate to="/projetos" replace />} />
          <Route path="/projetos" element={<Projects />} />
          <Route path="/horas" element={<TimeLogs />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Rotas exclusivas de admin */}
          <Route element={<AdminRoute />}>
            <Route path="/equipe" element={<Team />} />
            <Route path="/aprovacoes" element={<Aprovacoes />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
