import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field) => (e) =>
        setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data, error } = await signIn(formData);

            if (error) {
                setError('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
                return;
            }

            // O onAuthStateChange vai atualizar o AuthContext e o PublicOnlyRoute
            // redireciona automaticamente com base no status do perfil.
            if (data?.user) {
                navigate('/projetos', { replace: true });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent tracking-tight">
                        Horas Exatas
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">Sistema de Gestão de Horas</p>
                </div>

                {/* Card */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na conta</h2>

                    {error && (
                        <div className="flex items-start gap-2.5 p-3.5 bg-danger-light border border-danger/20 rounded-xl mb-5 text-danger text-sm">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label-text">E-mail</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange('email')}
                                    className="input-field pl-9"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label-text">Senha</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange('password')}
                                    className="input-field pl-9"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            Entrar
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Não tem acesso?{' '}
                    <Link to="/cadastro" className="text-primary font-semibold hover:underline">
                        Solicitar cadastro
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
