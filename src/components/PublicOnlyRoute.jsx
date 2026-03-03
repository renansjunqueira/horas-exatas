import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Guarda as rotas públicas (login, cadastro).
 * Se o usuário já estiver logado e aprovado, redireciona para o app.
 * Se estiver pendente, redireciona para a tela de espera.
 * Caso contrário, exibe a rota normalmente.
 */
const PublicOnlyRoute = () => {
    const { user, profile, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (user && profile?.approval_status === 'approved') {
        return <Navigate to="/projetos" replace />;
    }

    if (user && profile?.approval_status === 'pending') {
        return <Navigate to="/aguardando-aprovacao" replace />;
    }

    if (user && profile?.approval_status === 'rejected') {
        return <Navigate to="/acesso-negado" replace />;
    }

    return <Outlet />;
};

export default PublicOnlyRoute;
