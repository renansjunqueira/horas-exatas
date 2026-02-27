import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Check, X, User } from 'lucide-react';

export default function Team() {
    const { architects, addArchitect, updateArchitect, deleteArchitect } = useAppContext();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newName, setNewName] = useState('');

    // Delete Confirmation Modal State
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        if (editingId) {
            updateArchitect(editingId, newName.trim());
            setEditingId(null);
        } else {
            addArchitect(newName.trim());
        }

        setNewName('');
        setIsAdding(false);
    };

    const handleEdit = (architect) => {
        setNewName(architect.name);
        setEditingId(architect.id);
        setIsAdding(true);
    };

    const handleDeleteClick = (architect) => {
        setItemToDelete(architect);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteArchitect(itemToDelete.id);
            setItemToDelete(null);
        }
    };

    const cancelDelete = () => {
        setItemToDelete(null);
    };

    return (
        <div className="space-y-8 pb-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">Equipe</h2>
                    <p className="page-subtitle">Gerencie os arquitetos do escritório.</p>
                </div>
                <button
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setNewName('');
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                    <span>{isAdding ? 'Cancelar' : 'Novo Arquiteto'}</span>
                </button>
            </header>

            {isAdding && (
                <div className="card animate-in border-l-4 border-l-primary/60 max-w-2xl">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        {editingId ? 'Editar Arquiteto' : 'Cadastrar Novo Arquiteto'}
                    </h3>
                    <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                        <div className="space-y-1.5 flex-1">
                            <label className="label-text">Nome do Arquiteto</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Ex: Júlia Mendes"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn-primary flex items-center gap-2 pb-[11px] pt-[11px] h-[46px]">
                            <Check size={20} /> Salvar
                        </button>
                    </form>
                </div>
            )}

            <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100/80 text-gray-500 text-sm">
                                <th className="px-6 py-4 font-semibold rounded-tl-xl w-16"></th>
                                <th className="px-6 py-4 font-semibold w-6/12">Nome do Arquiteto</th>
                                <th className="px-6 py-4 font-semibold w-3/12">ID Interno</th>
                                <th className="px-6 py-4 font-semibold rounded-tr-xl w-2/12 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {architects.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Nenhum arquiteto cadastrado ainda.
                                    </td>
                                </tr>
                            ) : (
                                architects.map((architect) => (
                                    <tr key={architect.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <User size={20} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 text-lg">{architect.name}</td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-sm">#{architect.id}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(architect)}
                                                    className="text-gray-400 hover:text-primary transition-colors text-sm font-medium hover:underline"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(architect)}
                                                    className="text-gray-400 hover:text-danger transition-colors text-sm font-medium hover:underline"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 zoom-in-95">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Arquiteto?</h3>
                        <p className="text-gray-500 mb-6">
                            Tem certeza que deseja excluir o arquiteto <span className="font-semibold text-gray-800">"{itemToDelete.name}"</span>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-xl bg-danger text-white font-medium hover:bg-red-600 shadow-sm shadow-red-500/30 transition-all hover:shadow-red-500/50"
                            >
                                Sim, excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
