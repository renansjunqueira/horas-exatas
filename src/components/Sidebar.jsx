import { NavLink } from 'react-router-dom';
import { Briefcase, Users, CalendarClock, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
    const getNavClass = ({ isActive }) => {
        return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
                ? 'bg-primary/10 text-primary font-medium shadow-sm border-l-4 border-primary'
                : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'
            }`;
    };

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
            <div className="p-6 pb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent flex justify-center tracking-tight">
                    Horas Exatas
                </h1>
                <div className="h-1 w-12 bg-primary/20 rounded-full mx-auto mt-2"></div>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-2">
                <NavLink to="/projetos" className={getNavClass}>
                    <Briefcase size={20} className="w-5 h-5 flex-shrink-0" />
                    <span>Projetos</span>
                </NavLink>

                <NavLink to="/equipe" className={getNavClass}>
                    <Users size={20} className="w-5 h-5 flex-shrink-0" />
                    <span>Equipe</span>
                </NavLink>

                <NavLink to="/horas" className={getNavClass}>
                    <CalendarClock size={20} className="w-5 h-5 flex-shrink-0" />
                    <span>Registro de Horas</span>
                </NavLink>

                <NavLink to="/dashboard" className={getNavClass}>
                    <LayoutDashboard size={20} className="w-5 h-5 flex-shrink-0" />
                    <span>Dashboard</span>
                </NavLink>
            </nav>

            <div className="p-6 m-4 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">App internally prototype</p>
            </div>
        </aside>
    );
};

export default Sidebar;
