import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User } from 'lucide-react';

export default function Team() {
    const { architects } = useAppContext();

    return (
        <div className="space-y-8 pb-8">
            <header>
                <h2 className="page-title">Equipe</h2>
                <p className="page-subtitle">Membros ativos do escritório de arquitetura.</p>
            </header>

            <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100/80 text-gray-500 text-sm">
                                <th className="px-6 py-4 font-semibold rounded-tl-xl w-12"></th>
                                <th className="px-6 py-4 font-semibold">Nome</th>
                                <th className="px-6 py-4 font-semibold">E-mail</th>
                                <th className="px-6 py-4 font-semibold">Função</th>
                                <th className="px-6 py-4 font-semibold rounded-tr-xl">Desde</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {architects.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Nenhum membro aprovado ainda.
                                    </td>
                                </tr>
                            ) : (
                                architects.map((member) => {
                                    const initials = member.full_name
                                        .split(' ')
                                        .map(w => w[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase();

                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                                                    {initials || <User size={18} />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{member.full_name}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{member.email}</td>
                                            <td className="px-6 py-4">
                                                {member.role === 'admin' ? (
                                                    <span className="badge badge-primary">Admin</span>
                                                ) : (
                                                    <span className="badge bg-gray-100 text-gray-500">Membro</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {format(new Date(member.created_at), "MMM 'de' yyyy", { locale: ptBR })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
