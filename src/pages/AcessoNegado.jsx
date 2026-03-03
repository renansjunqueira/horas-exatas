import { ShieldX, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AcessoNegado = () => {
    const { signOut, user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">

                <div className="inline-flex items-center justify-center w-20 h-20 bg-danger-light border-2 border-danger/20 rounded-full mb-6">
                    <ShieldX className="w-10 h-10 text-danger" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso negado</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    O acesso da conta <strong className="text-gray-700">{user?.email}</strong> foi
                    recusado pela administração. Entre em contato caso acredite que houve um engano.
                </p>

                <button
                    onClick={signOut}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mx-auto"
                >
                    <LogOut size={15} />
                    Sair da conta
                </button>
            </div>
        </div>
    );
};

export default AcessoNegado;
