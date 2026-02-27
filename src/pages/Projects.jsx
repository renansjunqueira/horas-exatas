import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Check, X } from 'lucide-react';

export default function Projects() {
    const { projects, addProject, updateProjectStatus, updateProject, deleteProject } = useAppContext();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newProject, setNewProject] = useState({ name: '', startDate: '', status: 'Ativo' });

    // Delete Confirmation Modal State
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newProject.name || !newProject.startDate) return;

        if (editingId) {
            updateProject(editingId, newProject);
            setEditingId(null);
        } else {
            addProject(newProject);
        }

        setNewProject({ name: '', startDate: '', status: 'Ativo' });
        setIsAdding(false);
    };

    const handleEdit = (project) => {
        setNewProject({ name: project.name, startDate: project.startDate, status: project.status });
        setEditingId(project.id);
        setIsAdding(true);
    };

    const handleDeleteClick = (project) => {
        setItemToDelete(project);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteProject(itemToDelete.id);
            setItemToDelete(null);
        }
    };

    const cancelDelete = () => {
        setItemToDelete(null);
    };

    const toggleStatus = (id, currentStatus) => {
        updateProjectStatus(id, currentStatus === 'Ativo' ? 'Inativo' : 'Ativo');
    };

    return (
        <div className="space-y-8 pb-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">Projetos</h2>
                    <p className="page-subtitle">Gerencie os projetos do escritório de arquitetura.</p>
                </div>
                <button
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setNewProject({ name: '', startDate: '', status: 'Ativo' });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                    <span>{isAdding ? 'Cancelar' : 'Novo Projeto'}</span>
                </button>
            </header>

            {isAdding && (
                <div className="card animate-in border-l-4 border-l-primary/60">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        {editingId ? 'Editar Projeto' : 'Cadastrar Novo Projeto'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="label-text">Nome do Projeto</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Ex: Edifício Central"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="label-text">Data de Início</label>
                            <input
                                type="date"
                                required
                                className="input-field"
                                value={newProject.startDate}
                                onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="label-text">Status Inicial</label>
                            <select
                                className="input-field cursor-pointer"
                                value={newProject.status}
                                onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                            >
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 flex justify-end mt-2">
                            <button type="submit" className="btn-primary w-full sm:w-auto flex justify-center items-center gap-2">
                                <Check size={20} /> {editingId ? 'Salvar Alterações' : 'Salvar Projeto'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100/80 text-gray-500 text-sm">
                                <th className="px-6 py-4 font-semibold rounded-tl-xl w-6/12">Nome do Projeto</th>
                                <th className="px-6 py-4 font-semibold w-2/12">Data de Início</th>
                                <th className="px-6 py-4 font-semibold w-2/12 text-center">Status</th>
                                <th className="px-6 py-4 font-semibold rounded-tr-xl w-2/12 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Nenhum projeto cadastrado ainda.
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(project.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </td>
                                        <td className="px-6 py-4 flex justify-center">
                                            <button
                                                onClick={() => toggleStatus(project.id, project.status)}
                                                className={`badge transition-colors cursor-pointer border ${project.status === 'Ativo'
                                                    ? 'badge-success border-success-light hover:bg-success hover:text-white'
                                                    : 'badge-danger border-danger-light hover:bg-danger hover:text-white'
                                                    }`}
                                                title="Clique para alterar o status"
                                            >
                                                {project.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(project)}
                                                    className="text-gray-400 hover:text-primary transition-colors text-sm font-medium hover:underline"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(project)}
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Projeto?</h3>
                        <p className="text-gray-500 mb-6">
                            Tem certeza que deseja excluir o projeto <span className="font-semibold text-gray-800">"{itemToDelete.name}"</span>? Esta ação não pode ser desfeita.
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
