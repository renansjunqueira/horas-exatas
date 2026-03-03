import { useLocation } from 'react-router-dom';
import { Clock, LogOut, CheckCircle, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AguardandoAprovacao = () => {
    const { signOut, profile, user } = useAuth();
    const location = useLocation();
    const emailConfirmationRequired = location.state?.emailConfirmationRequired;

    const displayName = profile?.full_name || user?.email || 'usuário';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Ícone central */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-warning-light border-2 border-warning/30 rounded-full">
                        <Clock className="w-10 h-10 text-warning" />
                    </div>
                </div>

                {/* Título */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Cadastro em análise
                    </h1>
                    <p className="text-gray-500 leading-relaxed">
                        Olá, <span className="font-semibold text-gray-700">{displayName}</span>!
                        <br />
                        Seu cadastro foi recebido e está aguardando a aprovação da administração.
                    </p>
                </div>

                {/* Card de status */}
                <div className="card mb-6 space-y-4">
                    {emailConfirmationRequired && (
                        <div className="flex items-start gap-3 p-3 bg-warning-light rounded-xl">
                            <ShieldAlert size={18} className="text-warning flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Confirme seu e-mail</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Enviamos um link de confirmação para <strong>{user?.email}</strong>.
                                    Confirme o e-mail antes de fazer login.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-success flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Cadastro criado com sucesso</p>
                            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock size={18} className="text-warning flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Aguardando aprovação</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                A administração irá revisar e liberar seu acesso em breve.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Mail size={18} className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Notificação por e-mail</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Você será notificado quando o acesso for liberado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sair */}
                {user && (
                    <div className="flex justify-center">
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <LogOut size={15} />
                            Sair da conta
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AguardandoAprovacao;
