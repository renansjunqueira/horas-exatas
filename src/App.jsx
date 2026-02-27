import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Projects from './pages/Projects';
import Team from './pages/Team';
import TimeLogs from './pages/TimeLogs';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/projetos" replace />} />
        <Route path="projetos" element={<Projects />} />
        <Route path="equipe" element={<Team />} />
        <Route path="horas" element={<TimeLogs />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
