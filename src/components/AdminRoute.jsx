import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guarda rotas exclusivas de admin.
 * Se o usuário não for admin, redireciona para /projetos.
 * Usado no Passo 3 para a rota /aprovacoes.
 */
const AdminRoute = () => {
    const { isAdmin } = useAuth();

    if (!isAdmin) return <Navigate to="/projetos" replace />;

    return <Outlet />;
};

export default AdminRoute;
