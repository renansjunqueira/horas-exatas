import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppContext } from '../context/AppContext';
import { Loader2, Menu } from 'lucide-react';

const Layout = () => {
    const { isLoading } = useAppContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center px-4 z-20 shadow-sm">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 mr-3 text-gray-500 hover:text-primary transition-colors">
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent tracking-tight">
                    Horas Exatas
                </h1>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto overflow-x-hidden pt-20 md:pt-8 px-4 sm:px-6 md:px-10 pb-12">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-primary">
                            <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                            <p className="text-gray-500 font-medium animate-pulse">Sincronizando com a nuvem...</p>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Layout;
