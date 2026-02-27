import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Save, AlertTriangle, Plus, Trash2 } from 'lucide-react';

export default function TimeLogs() {
    const { projects, architects, logHours, hoursLog, removeRowHours } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [alertMsg, setAlertMsg] = useState('');

    // Grid State
    // Format: [ { id: rowId, architectId: '', projectId: '', hours: { '1': 4, '2': 8 } } ]
    const [rows, setRows] = useState([]);

    const activeProjects = projects.filter(p => p.status === 'Ativo');

    const daysInMonth = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
    const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

    // Load existing data for the current month into rows on date change
    useEffect(() => {
        const yearMonth = format(currentDate, 'yyyy-MM');
        const newRows = [];

        // Find matching logs in the context
        Object.keys(hoursLog).forEach(dateStr => {
            if (dateStr.startsWith(yearMonth)) {
                const day = parseInt(dateStr.split('-')[2], 10);

                Object.keys(hoursLog[dateStr]).forEach(archId => {
                    Object.keys(hoursLog[dateStr][archId]).forEach(projId => {
                        const hours = hoursLog[dateStr][archId][projId];

                        // Try to find an existing row for this arch + proj
                        let rowIndex = newRows.findIndex(r => r.architectId === archId && r.projectId === projId);
                        if (rowIndex === -1) {
                            newRows.push({ id: Date.now() + Math.random(), architectId: archId, projectId: projId, hours: {} });
                            rowIndex = newRows.length - 1;
                        }
                        newRows[rowIndex].hours[day.toString()] = hours;
                    });
                });
            }
        });

        // If no rows, add an empty one to start
        if (newRows.length === 0) {
            newRows.push({ id: Date.now(), architectId: '', projectId: '', hours: {} });
        }

        setRows(newRows);
    }, [currentDate, hoursLog]);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const addRow = () => {
        setRows([...rows, { id: Date.now(), architectId: '', projectId: '', hours: {} }]);
    };

    const removeRow = (row) => {
        // Remove from local grid state
        setRows(rows.filter(r => r.id !== row.id));

        // If the row had valid data, also remove it from the global AppContext immediately 
        // to prevent it from coming back on Save
        if (row.architectId && row.projectId) {
            const yearMonth = format(currentDate, 'yyyy-MM');
            removeRowHours(yearMonth, row.architectId, row.projectId);
        }
    };

    const updateRow = (id, field, value) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const updateHours = (rowId, day, value) => {
        setRows(rows.map(r => {
            if (r.id === rowId) {
                const newHours = { ...r.hours };
                const parsed = parseFloat(value);
                if (!isNaN(parsed) && parsed > 0) {
                    newHours[day.toString()] = parsed;
                } else {
                    delete newHours[day.toString()];
                }
                return { ...r, hours: newHours };
            }
            return r;
        }));
        setAlertMsg(''); // clear previous alerts
    };

    const calculateTotalDayHours = (architectId, day) => {
        if (!architectId) return 0;
        let total = 0;
        rows.forEach(r => {
            if (r.architectId === architectId && r.hours[day.toString()]) {
                total += r.hours[day.toString()];
            }
        });
        return total;
    };

    const handleSave = () => {
        let hasAlert = false;
        let warningMsg = '';

        // First validate totals
        for (const r of rows) {
            if (!r.architectId || !r.projectId) continue;

            for (const day of daysArray) {
                const total = calculateTotalDayHours(r.architectId, day);
                if (total > 8) {
                    hasAlert = true;
                    const arch = architects.find(a => a.id.toString() === r.architectId.toString());
                    warningMsg = `Aviso: ${arch?.name} ultrapassou 8 horas no dia ${day}. Os registros foram salvos.`;
                    break; // only need one warning per save
                }
            }
            if (hasAlert) break;
        }

        if (hasAlert) {
            setAlertMsg(warningMsg);
        } else {
            setAlertMsg('Registros salvos com sucesso!');
            setTimeout(() => setAlertMsg(''), 3000);
        }

        // Save to context
        const monthPrefix = format(currentDate, 'yyyy-MM');

        rows.forEach(r => {
            if (!r.architectId || !r.projectId) return;

            daysArray.forEach(day => {
                const dateStr = `${monthPrefix}-${day.toString().padStart(2, '0')}`;
                const hours = r.hours[day.toString()] || 0;

                logHours(dateStr, r.architectId, r.projectId, hours);
            });
        });
    };

    return (
        <div className="space-y-6 pb-20">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">Registro de Horas</h2>
                    <p className="page-subtitle">Aponte as horas dedicadas por arquiteto em cada projeto.</p>
                </div>

                <div className="flex items-center gap-4 bg-white px-4 py-2 hover:shadow-sm rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-gray-800 capitalize w-40 text-center select-none">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            {alertMsg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in ${alertMsg.includes('Aviso') ? 'bg-warning-light text-warning-dark border border-warning/20' : 'bg-success-light text-success border border-success/20'}`}>
                    <AlertTriangle size={20} className={alertMsg.includes('Aviso') ? 'text-warning' : 'text-success'} />
                    <span className="font-medium">{alertMsg}</span>
                </div>
            )}

            <div className="card !p-0 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100/80 text-xs text-gray-500">
                                <th className="px-4 py-3 font-semibold rounded-tl-xl sticky left-0 bg-gray-50/95 backdrop-blur-sm z-10 w-48 min-w-[200px]">Arquiteto</th>
                                <th className="px-4 py-3 font-semibold sticky left-[200px] bg-gray-50/95 backdrop-blur-sm z-10 w-48 min-w-[200px] border-r border-gray-200/60">Projeto</th>
                                {daysArray.map(day => (
                                    <th key={day} className="px-2 py-3 font-semibold text-center w-12 min-w-[48px]">{day}</th>
                                ))}
                                <th className="px-4 py-3 font-semibold text-center rounded-tr-xl">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/60">
                            {rows.map((row) => (
                                <tr key={row.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-2 sticky left-0 bg-white group-hover:bg-blue-50/50 transition-colors z-10">
                                        <select
                                            className="w-full bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-gray-800"
                                            value={row.architectId}
                                            onChange={(e) => updateRow(row.id, 'architectId', e.target.value)}
                                        >
                                            <option value="" disabled>Selecionar...</option>
                                            {!architects.some(a => a.id.toString() === row.architectId?.toString()) && row.architectId ? (
                                                <option value={row.architectId} disabled className="text-danger font-medium">Arquiteto Excluído</option>
                                            ) : null}
                                            {architects.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2 sticky left-[200px] bg-white group-hover:bg-blue-50/50 transition-colors z-10 border-r border-gray-100 overflow-hidden text-ellipsis whitespace-nowrap">
                                        <select
                                            className="w-full bg-transparent border-none text-sm text-gray-600 focus:ring-0 cursor-pointer"
                                            value={row.projectId}
                                            onChange={(e) => updateRow(row.id, 'projectId', e.target.value)}
                                        >
                                            <option value="" disabled>Selecionar...</option>
                                            {!projects.some(p => p.id.toString() === row.projectId?.toString()) && row.projectId ? (
                                                <option value={row.projectId} disabled className="text-danger font-medium">Projeto Excluído</option>
                                            ) : null}
                                            {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </td>

                                    {daysArray.map(day => {
                                        const totalDay = calculateTotalDayHours(row.architectId, day);
                                        const isOverLimit = totalDay > 8;
                                        const val = row.hours[day.toString()] || '';

                                        return (
                                            <td key={day} className={`p-1 text-center border-r border-gray-50/50 transition-colors ${val ? 'bg-blue-50/30' : ''}`}>
                                                <input
                                                    type="text"
                                                    maxLength="4"
                                                    className={`w-full text-center bg-transparent border hover:border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md py-1.5 text-sm transition-all focus:bg-white
                            ${val ? 'font-semibold text-primary-dark border-transparent' : 'border-transparent text-gray-600'}
                            ${isOverLimit && val ? '!text-danger !bg-danger-light/30' : ''}
                          `}
                                                    title={isOverLimit ? "Total de horas diárias > 8h" : ""}
                                                    value={val}
                                                    onChange={(e) => {
                                                        // Only allow numbers and decimal point
                                                        const v = e.target.value.replace(/[^0-9.]/g, '');
                                                        updateHours(row.id, day, v);
                                                    }}
                                                />
                                            </td>
                                        );
                                    })}

                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => removeRow(row)}
                                            className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger-light/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={addRow}
                        className="text-primary font-medium flex items-center gap-1.5 hover:text-primary-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5"
                    >
                        <Plus size={18} /> Adicionar Linha
                    </button>

                    <button
                        onClick={handleSave}
                        className="btn-primary shadow-blue-500/20 flex items-center gap-2"
                    >
                        <Save size={18} /> Confirmar Registros
                    </button>
                </div>
            </div>
        </div>
    );
}
