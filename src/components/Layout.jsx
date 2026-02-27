import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppContext } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

const Layout = () => {
    const { isLoading } = useAppContext();

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden pt-8 px-10 pb-12 w-full max-w-[1400px] mx-auto">
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
