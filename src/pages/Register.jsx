import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mínimo 8 caracteres, pelo menos 1 letra e 1 número
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const Register = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        // Limpa o erro do campo ao digitar
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const errors = {};
        if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
            errors.fullName = 'Informe seu nome completo (mínimo 3 caracteres).';
        }
        if (!formData.email) {
            errors.email = 'Informe um e-mail válido.';
        }
        if (!PASSWORD_REGEX.test(formData.password)) {
            errors.password = 'A senha deve ter no mínimo 8 caracteres, incluindo letras e números.';
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'As senhas não coincidem.';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);

        const { data, error } = await signUp({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName.trim(),
        });

        if (error) {
            if (error.message?.toLowerCase().includes('already registered')) {
                setServerError('Este e-mail já está cadastrado. Tente fazer login.');
            } else {
                setServerError('Ocorreu um erro ao criar a conta. Tente novamente.');
            }
            setIsLoading(false);
            return;
        }

        // Se o Supabase exigir confirmação de e-mail, data.session será null.
        // Nesse caso, redirecionamos para /aguardando-aprovacao com um aviso extra.
        navigate('/aguardando-aprovacao', { replace: true, state: { emailConfirmationRequired: !data?.session } });
    };

    const inputClass = (field) =>
        `input-field pl-9 ${fieldErrors[field] ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''}`;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent tracking-tight">
                        Horas Exatas
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">Solicite seu acesso ao sistema</p>
                </div>

                {/* Card */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Criar conta</h2>

                    {serverError && (
                        <div className="flex items-start gap-2.5 p-3.5 bg-danger-light border border-danger/20 rounded-xl mb-5 text-danger text-sm">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            <p>{serverError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="label-text">Nome completo</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    autoComplete="name"
                                    value={formData.fullName}
                                    onChange={handleChange('fullName')}
                                    className={inputClass('fullName')}
                                    placeholder="Seu nome completo"
                                />
                            </div>
                            {fieldErrors.fullName && (
                                <p className="mt-1.5 text-xs text-danger">{fieldErrors.fullName}</p>
                            )}
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className="label-text">E-mail</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange('email')}
                                    className={inputClass('email')}
                                    placeholder="seu@email.com"
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-xs text-danger">{fieldErrors.email}</p>
                            )}
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="label-text">Senha</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange('password')}
                                    className={inputClass('password')}
                                    placeholder="••••••••"
                                />
                            </div>
                            {fieldErrors.password ? (
                                <p className="mt-1.5 text-xs text-danger">{fieldErrors.password}</p>
                            ) : (
                                <p className="mt-1.5 text-xs text-gray-400">
                                    Mínimo 8 caracteres, com letras e números.
                                </p>
                            )}
                        </div>

                        {/* Confirmar senha */}
                        <div>
                            <label className="label-text">Confirmar senha</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    className={inputClass('confirmPassword')}
                                    placeholder="••••••••"
                                />
                            </div>
                            {fieldErrors.confirmPassword && (
                                <p className="mt-1.5 text-xs text-danger">{fieldErrors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            Solicitar acesso
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
