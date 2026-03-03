import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Guarda todas as rotas autenticadas.
 * Enquanto o estado de auth carrega → spinner.
 * Sem sessão               → /login
 * Status pending           → /aguardando-aprovacao
 * Status rejected          → /acesso-negado
 * Aprovado                 → renderiza os filhos normalmente
 */
const ProtectedRoute = () => {
    const { user, profile, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm text-gray-500 font-medium">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    // profile null = trigger ainda criando o registro ou RLS bloqueou leitura → trata como pending
    if (!profile || profile.approval_status === 'pending') {
        return <Navigate to="/aguardando-aprovacao" replace />;
    }

    if (profile.approval_status === 'rejected') {
        return <Navigate to="/acesso-negado" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
