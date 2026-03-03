import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import {
    ShieldCheck, ShieldX, Clock, Users, CheckCircle2,
    XCircle, Loader2, RefreshCw, UserCheck, AlertCircle, Link2
} from 'lucide-react';

// ─── Card de usuário pendente ────────────────────────────────────────────────

const UserCard = ({ user, onApproveClick, onReject, loadingId }) => {
    const isActing = loadingId === user.id;
    const createdAt = new Date(user.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
    const initials = user.full_name
        ? user.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
        : '?';

    return (
        <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-warning-light border-2 border-warning/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-warning">{initials}</span>
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.full_name}</p>
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
                <p className="text-xs text-gray-300 mt-0.5">Cadastro em {createdAt}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => onReject(user.id)}
                    disabled={isActing}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-danger border border-danger/30 bg-danger-light rounded-xl hover:bg-danger hover:text-white transition-all duration-200 disabled:opacity-40"
                >
                    {isActing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Rejeitar
                </button>

                <button
                    onClick={() => onApproveClick(user)}
                    disabled={isActing}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-success rounded-xl hover:bg-success/90 transition-all duration-200 shadow-sm disabled:opacity-40"
                >
                    {isActing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Aprovar
                </button>
            </div>
        </div>
    );
};

// ─── Modal de aprovação + vínculo ────────────────────────────────────────────

const ApproveModal = ({ linkModal, setLinkModal, onConfirm, isLoading }) => {
    if (!linkModal) return null;
    const { user, architects, linkChoice } = linkModal;
    const initials = user.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';
    const isSkip = linkChoice === 'skip';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in slide-in-from-bottom-4 zoom-in-95">

                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="text-success" size={20} />
                        Aprovar acesso
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Vincule o usuário a um arquiteto para liberar o lançamento de horas.
                    </p>
                </div>

                {/* User info */}
                <div className="px-6 py-4 flex items-center gap-3 bg-gray-50/60 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-warning-light border-2 border-warning/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-warning">{initials}</span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.full_name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                </div>

                {/* Seleção de arquiteto */}
                <div className="p-6 space-y-3">
                    <label className="label-text flex items-center gap-1.5">
                        <Link2 size={14} className="text-primary" />
                        Vincular a um arquiteto
                    </label>
                    <select
                        className="input-field"
                        value={linkChoice}
                        onChange={(e) => setLinkModal(prev => ({ ...prev, linkChoice: e.target.value }))}
                    >
                        {architects.length > 0 && (
                            <optgroup label="── Arquitetos sem conta vinculada ──">
                                {architects.map(a => (
                                    <option key={a.id} value={a.id.toString()}>{a.name}</option>
                                ))}
                            </optgroup>
                        )}
                        <optgroup label="── Outras opções ──">
                            <option value="new">+ Criar novo arquiteto — "{user.full_name}"</option>
                            <option value="skip">Vincular depois (apenas aprovar)</option>
                        </optgroup>
                    </select>

                    {isSkip && (
                        <p className="text-xs text-gray-400 flex items-start gap-1.5">
                            <AlertCircle size={12} className="mt-0.5 flex-shrink-0 text-warning" />
                            O usuário verá um aviso na tela de Horas até ser vinculado.
                        </p>
                    )}
                    {linkChoice === 'new' && (
                        <p className="text-xs text-gray-400">
                            Será criado um novo registro de arquiteto com o nome "{user.full_name}".
                        </p>
                    )}
                </div>

                {/* Ações */}
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={() => setLinkModal(null)}
                        disabled={isLoading}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {isSkip ? 'Aprovar sem vínculo' : 'Aprovar e vincular'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Componente Principal ────────────────────────────────────────────────────

const STATUS_TABS = [
    { key: 'pending',  label: 'Pendentes',  icon: Clock },
    { key: 'approved', label: 'Aprovados',  icon: UserCheck },
    { key: 'rejected', label: 'Rejeitados', icon: ShieldX },
];

const Aprovacoes = () => {
    const { refreshData } = useAppContext();
    const [profiles, setProfiles] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [loadingId, setLoadingId] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [toast, setToast] = useState(null);

    // Estado do modal de aprovação + vínculo
    const [linkModal, setLinkModal] = useState(null); // { user, architects, linkChoice }
    const [isLinkLoading, setIsLinkLoading] = useState(false);

    // ── Fetch profiles ─────────────────────────────────────────────────────
    const fetchProfiles = useCallback(async () => {
        setIsFetching(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, approval_status, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            showToast('error', 'Não foi possível carregar os usuários.');
        } else {
            setProfiles(data || []);
        }
        setIsFetching(false);
    }, []);

    useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

    // ── Toast ──────────────────────────────────────────────────────────────
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Abrir modal de aprovação ───────────────────────────────────────────
    const openApproveModal = async (user) => {
        // Busca arquitetos sem conta vinculada
        const { data } = await supabase
            .from('architects')
            .select('id, name')
            .is('user_id', null)
            .order('name');

        const architects = data || [];
        // linkChoice padrão: primeiro arquiteto disponível, ou 'new', ou 'skip'
        const defaultChoice = architects.length > 0 ? architects[0].id.toString() : 'new';

        setLinkModal({ user, architects, linkChoice: defaultChoice });
    };

    // ── Confirmar aprovação + vínculo ──────────────────────────────────────
    const confirmApprove = async () => {
        if (!linkModal) return;
        const { user, linkChoice } = linkModal;
        setIsLinkLoading(true);

        // 1. Aprovar o usuário
        const { error: approveErr } = await supabase
            .from('profiles')
            .update({ approval_status: 'approved' })
            .eq('id', user.id);

        if (approveErr) {
            showToast('error', 'Erro ao aprovar o usuário. Tente novamente.');
            setIsLinkLoading(false);
            return;
        }

        // 2. Vincular arquiteto (se não for 'skip')
        if (linkChoice === 'new') {
            await supabase.from('architects').insert({ name: user.full_name, user_id: user.id });
        } else if (linkChoice !== 'skip') {
            await supabase.from('architects').update({ user_id: user.id }).eq('id', linkChoice);
        }

        // 3. Atualizar estado local + contexto de dados
        setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, approval_status: 'approved' } : p));
        showToast('success', linkChoice === 'skip' ? 'Usuário aprovado!' : 'Usuário aprovado e vinculado!');
        refreshData(); // atualiza architects no AppContext para que TimeLogs funcione imediatamente
        setLinkModal(null);
        setIsLinkLoading(false);
    };

    // ── Rejeitar / revogar / reativar ──────────────────────────────────────
    const updateStatus = async (userId, newStatus) => {
        setLoadingId(userId);
        const { error } = await supabase
            .from('profiles')
            .update({ approval_status: newStatus })
            .eq('id', userId);

        if (error) {
            showToast('error', 'Erro ao atualizar status. Tente novamente.');
        } else {
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, approval_status: newStatus } : p));
            const msg = newStatus === 'approved' ? 'Acesso reativado!' : 'Acesso do usuário foi rejeitado.';
            showToast('success', msg);
        }
        setLoadingId(null);
    };

    // ── Dados filtrados ────────────────────────────────────────────────────
    const counts = {
        pending:  profiles.filter(p => p.approval_status === 'pending').length,
        approved: profiles.filter(p => p.approval_status === 'approved').length,
        rejected: profiles.filter(p => p.approval_status === 'rejected').length,
    };
    const filtered = profiles.filter(p => p.approval_status === activeTab);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                    toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {toast.message}
                </div>
            )}

            {/* Cabeçalho */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <ShieldCheck className="text-primary" size={28} />
                        Aprovações
                    </h1>
                    <p className="page-subtitle">Gerencie o acesso dos colaboradores ao sistema.</p>
                </div>
                <button onClick={fetchProfiles} disabled={isFetching} className="btn-secondary flex items-center gap-2">
                    <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
                    Atualizar
                </button>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card text-center">
                    <p className="text-2xl font-bold text-warning">{counts.pending}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">Pendentes</p>
                </div>
                <div className="card text-center">
                    <p className="text-2xl font-bold text-success">{counts.approved}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">Aprovados</p>
                </div>
                <div className="card text-center">
                    <p className="text-2xl font-bold text-danger">{counts.rejected}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">Rejeitados</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                {STATUS_TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Icon size={14} />
                        {label}
                        {counts[key] > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                key === 'pending'  ? 'bg-warning-light text-warning' :
                                key === 'approved' ? 'bg-success-light text-success' :
                                                     'bg-danger-light text-danger'
                            }`}>
                                {counts[key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {isFetching ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-16 text-center">
                    <Users size={40} className="text-gray-200 mb-3" />
                    <p className="font-semibold text-gray-400">
                        {activeTab === 'pending'  && 'Nenhum cadastro aguardando aprovação.'}
                        {activeTab === 'approved' && 'Nenhum usuário aprovado ainda.'}
                        {activeTab === 'rejected' && 'Nenhum usuário rejeitado.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(user => (
                        activeTab === 'pending' ? (
                            <UserCard
                                key={user.id}
                                user={user}
                                onApproveClick={openApproveModal}
                                onReject={(id) => updateStatus(id, 'rejected')}
                                loadingId={loadingId}
                            />
                        ) : (
                            <div key={user.id} className="card flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                    activeTab === 'approved' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                                }`}>
                                    {user.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{user.full_name}</p>
                                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`badge ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                        {user.role === 'admin' ? 'Admin' : 'Usuário'}
                                    </span>
                                    {activeTab === 'approved' && (
                                        <button
                                            onClick={() => updateStatus(user.id, 'rejected')}
                                            disabled={loadingId === user.id}
                                            className="text-xs text-gray-400 hover:text-danger transition-colors px-2 py-1 rounded-lg hover:bg-danger-light"
                                        >
                                            {loadingId === user.id ? <Loader2 size={12} className="animate-spin" /> : 'Revogar'}
                                        </button>
                                    )}
                                    {activeTab === 'rejected' && (
                                        <button
                                            onClick={() => openApproveModal(user)}
                                            disabled={loadingId === user.id}
                                            className="text-xs text-gray-400 hover:text-success transition-colors px-2 py-1 rounded-lg hover:bg-success-light"
                                        >
                                            {loadingId === user.id ? <Loader2 size={12} className="animate-spin" /> : 'Reativar'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Modal de aprovação + vínculo */}
            <ApproveModal
                linkModal={linkModal}
                setLinkModal={setLinkModal}
                onConfirm={confirmApprove}
                isLoading={isLinkLoading}
            />
        </div>
    );
};

export default Aprovacoes;
