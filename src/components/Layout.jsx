import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden pt-8 px-10 pb-12 w-full max-w-[1400px] mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
