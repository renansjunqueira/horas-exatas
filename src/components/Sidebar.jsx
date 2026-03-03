import { NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Users, CalendarClock, LayoutDashboard, X, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onClose }) => {
    const { profile, isAdmin, signOut } = useAuth();
    const navigate = useNavigate();

    const getNavClass = ({ isActive }) => {
        return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
            ? 'bg-primary/10 text-primary font-medium shadow-sm border-l-4 border-primary'
            : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'
            }`;
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login', { replace: true });
    };

    // Iniciais para avatar
    const initials = profile?.full_name
        ? profile.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
        : '?';

    return (
        <aside className="w-64 bg-white/95 backdrop-blur-xl border-r border-gray-100 flex flex-col h-screen relative shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fechar menu"
            >
                <X size={20} />
            </button>

            <div className="p-6 pb-8 pt-8 md:pt-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent flex justify-center tracking-tight">
                    Horas Exatas
                </h1>
                <div className="h-1 w-12 bg-primary/20 rounded-full mx-auto mt-2 mb-2 md:mt-2"></div>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-2">
                <NavLink to="/projetos" className={getNavClass} onClick={onClose}>
                    <Briefcase size={20} className="w-5 h-5 flex-shrink-0" />
                    <span>Projetos</span>
                </NavLink>

                {/* Equipe: visível apenas para admins */}
                {isAdmin && (
                    <NavLink to="/equipe" className={getNavClass} onClick={onClose}>
                        <Users size={20} className="w-5 h-5 flex-shrink-0" />
                        <span>Equipe</span>
                    </NavLink>
                )}

                <NavLink to="/horas" className={getNavClass} onClick={onClose}>
                    <CalendarClock size={20} className="w-5 h-5 flex-shrink-0" />
                    <span>Registro de Horas</span>
                </NavLink>

                <NavLink to="/dashboard" className={getNavClass} onClick={onClose}>
                    <LayoutDashboard size={20} className="w-5 h-5 flex-shrink-0" />
                    <span>Dashboard</span>
                </NavLink>

                {/* Aprovações: exclusivo para admins (Passo 3) */}
                {isAdmin && (
                    <NavLink to="/aprovacoes" className={getNavClass} onClick={onClose}>
                        <ShieldCheck size={20} className="w-5 h-5 flex-shrink-0" />
                        <span>Aprovações</span>
                    </NavLink>
                )}
            </nav>

            {/* Rodapé com info do usuário e logout */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    {/* Avatar com iniciais */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {profile?.full_name || 'Usuário'}
                        </p>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            isAdmin
                                ? 'text-primary bg-primary/10'
                                : 'text-gray-500 bg-gray-100'
                        }`}>
                            {isAdmin ? 'Admin' : 'Usuário'}
                        </span>
                    </div>

                    <button
                        onClick={handleSignOut}
                        title="Sair"
                        className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger-light rounded-lg transition-colors flex-shrink-0"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
