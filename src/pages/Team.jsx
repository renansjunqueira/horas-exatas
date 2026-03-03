import { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Plus, Check, X, User, Link2, Unlink, Loader2, AlertCircle } from 'lucide-react';

export default function Team() {
    const { architects, addArchitect, updateArchitect, deleteArchitect, refreshData } = useAppContext();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newName, setNewName] = useState('');
    const [itemToDelete, setItemToDelete] = useState(null);

    // ── Estado do modal de vínculo ─────────────────────────────────────────
    // linkModal: { architect } | null
    const [linkModal, setLinkModal] = useState(null);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isLinkLoading, setIsLinkLoading] = useState(false);

    // ── CRUD existente ─────────────────────────────────────────────────────
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

    const handleDeleteClick = (architect) => setItemToDelete(architect);
    const cancelDelete = () => setItemToDelete(null);
    const confirmDelete = () => {
        if (itemToDelete) {
            deleteArchitect(itemToDelete.id);
            setItemToDelete(null);
        }
    };

    // ── Abrir modal de vínculo ─────────────────────────────────────────────
    const openLinkModal = useCallback(async (architect) => {
        // Busca usuários aprovados que ainda não têm arquiteto vinculado
        const linkedUserIds = architects
            .filter(a => a.user_id)
            .map(a => a.user_id);

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('approval_status', 'approved')
            .order('full_name');

        const unlinked = (profiles || []).filter(p => !linkedUserIds.includes(p.id));

        setAvailableUsers(unlinked);
        setSelectedUserId(unlinked.length > 0 ? unlinked[0].id : '');
        setLinkModal({ architect });
    }, [architects]);

    // ── Confirmar vínculo ──────────────────────────────────────────────────
    const confirmLink = async () => {
        if (!linkModal || !selectedUserId) return;
        setIsLinkLoading(true);

        const { error } = await supabase
            .from('architects')
            .update({ user_id: selectedUserId })
            .eq('id', linkModal.architect.id);

        if (!error) {
            refreshData();
            setLinkModal(null);
        }
        setIsLinkLoading(false);
    };

    // ── Desvincular conta ──────────────────────────────────────────────────
    const unlinkArchitect = async (architectId) => {
        await supabase.from('architects').update({ user_id: null }).eq('id', architectId);
        refreshData();
    };

    return (
        <div className="space-y-8 pb-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">Equipe</h2>
                    <p className="page-subtitle">Gerencie os arquitetos e suas contas de acesso.</p>
                </div>
                <button
                    onClick={() => {
                        if (isAdding) { setIsAdding(false); setEditingId(null); setNewName(''); }
                        else { setIsAdding(true); }
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
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100/80 text-gray-500 text-sm">
                                <th className="px-6 py-4 font-semibold rounded-tl-xl w-12"></th>
                                <th className="px-6 py-4 font-semibold w-5/12">Nome do Arquiteto</th>
                                <th className="px-6 py-4 font-semibold w-3/12">Conta de Acesso</th>
                                <th className="px-6 py-4 font-semibold rounded-tr-xl w-3/12 text-right">Ações</th>
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

                                        {/* Coluna de conta vinculada */}
                                        <td className="px-6 py-4">
                                            {architect.user_id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success-light px-2.5 py-1 rounded-full">
                                                        <Link2 size={11} />
                                                        Vinculada
                                                    </span>
                                                    <button
                                                        onClick={() => unlinkArchitect(architect.id)}
                                                        className="p-1 text-gray-300 hover:text-danger transition-colors rounded opacity-0 group-hover:opacity-100"
                                                        title="Desvincular conta"
                                                    >
                                                        <Unlink size={13} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openLinkModal(architect)}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary border border-dashed border-gray-200 hover:border-primary/40 px-2.5 py-1 rounded-full transition-colors"
                                                >
                                                    <Link2 size={11} />
                                                    Vincular conta
                                                </button>
                                            )}
                                        </td>

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

            {/* Modal: Excluir arquiteto */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 zoom-in-95">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Arquiteto?</h3>
                        <p className="text-gray-500 mb-6">
                            Tem certeza que deseja excluir <span className="font-semibold text-gray-800">"{itemToDelete.name}"</span>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={cancelDelete} className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 rounded-xl bg-danger text-white font-medium hover:bg-red-600 shadow-sm shadow-red-500/30 transition-all">
                                Sim, excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Vincular conta */}
            {linkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in slide-in-from-bottom-4 zoom-in-95">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Link2 className="text-primary" size={20} />
                                Vincular conta ao arquiteto
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Selecione o usuário aprovado que corresponde a <strong>{linkModal.architect.name}</strong>.
                            </p>
                        </div>

                        <div className="p-6">
                            {availableUsers.length === 0 ? (
                                <div className="flex items-start gap-2.5 p-3.5 bg-warning-light rounded-xl text-sm text-gray-700">
                                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-warning" />
                                    Não há usuários aprovados disponíveis para vincular. Aprove um usuário na aba Aprovações primeiro.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="label-text">Usuário aprovado</label>
                                    <select
                                        className="input-field"
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                    >
                                        {availableUsers.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.full_name} — {u.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-6 flex justify-end gap-3">
                            <button
                                onClick={() => setLinkModal(null)}
                                disabled={isLinkLoading}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLink}
                                disabled={isLinkLoading || availableUsers.length === 0}
                                className="btn-primary flex items-center gap-2"
                            >
                                {isLinkLoading && <Loader2 size={14} className="animate-spin" />}
                                Vincular
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
