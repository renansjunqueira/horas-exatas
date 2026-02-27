import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, BarChart3, PieChart } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Helper function to generate pastel colors for charts
const generateColors = (count) => {
    const baseHues = [210, 160, 340, 45, 280, 15, 190, 85, 30]; // distinct starting hues

    return Array.from({ length: count }, (_, i) => {
        const hue = baseHues[i % baseHues.length];
        return `hsl(${hue}, 75%, 60%)`;
    });
};

export default function Dashboard() {
    const { projects, architects, hoursLog } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());

    const yearMonth = format(currentDate, 'yyyy-MM');

    // Compute Data for Bar Chart: Total Hours per Architect per Project
    const { barData, pieData, totalMonthHours } = useMemo(() => {
        // Structure: { archId_projId: totalHours }
        const agg = {};
        let total = 0;

        // Architect totals for Pie chart
        const archTotals = {};

        Object.keys(hoursLog).forEach(dateStr => {
            if (dateStr.startsWith(yearMonth)) {
                Object.keys(hoursLog[dateStr]).forEach(archId => {
                    // Skip if the architect no longer exists
                    const architectExists = architects.some(a => a.id.toString() === archId);
                    if (!architectExists) return;

                    Object.keys(hoursLog[dateStr][archId]).forEach(projId => {
                        // Skip if the project no longer exists
                        const projectExists = projects.some(p => p.id.toString() === projId);
                        if (!projectExists) return;

                        const h = hoursLog[dateStr][archId][projId];
                        const key = `${archId}_${projId}`;

                        agg[key] = (agg[key] || 0) + h;
                        archTotals[archId] = (archTotals[archId] || 0) + h;
                        total += h;
                    });
                });
            }
        });

        // Prepare Bar Chart Data
        // We want X-axis = Architects, each dataset = A distinct Project
        const uniqueArchIds = Object.keys(archTotals);
        // Find all unique project IDs that have >0 hours this month
        const activeProjIds = [...new Set(Object.keys(agg).map(k => k.split('_')[1]))];

        const projColors = generateColors(activeProjIds.length);

        const datasets = activeProjIds.map((projId, index) => {
            const proj = projects.find(p => p.id.toString() === projId);
            const projName = proj ? proj.name : `Projeto ${projId}`;

            return {
                label: projName,
                data: uniqueArchIds.map(archId => agg[`${archId}_${projId}`] || 0),
                backgroundColor: projColors[index],
                borderRadius: 6,
                borderWidth: 0,
            };
        });

        const archLabels = uniqueArchIds.map(id => {
            const arch = architects.find(a => a.id.toString() === id);
            return arch ? arch.name : `Arquiteto ${id}`;
        });

        const computedBarData = {
            labels: archLabels,
            datasets
        };

        // Prepare Pie Chart Data
        const archColors = generateColors(uniqueArchIds.length).reverse();
        const computedPieData = {
            labels: archLabels,
            datasets: [
                {
                    data: uniqueArchIds.map(id => archTotals[id]),
                    backgroundColor: archColors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }
            ]
        };

        return { barData: computedBarData, pieData: computedPieData, totalMonthHours: total };

    }, [hoursLog, yearMonth, projects, architects]);


    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                titleFont: { size: 14, family: "'Inter', sans-serif" },
                bodyFont: { size: 13, family: "'Inter', sans-serif" },
                cornerRadius: 8,
            }
        },
        scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, border: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' } }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed + 'h';
                        }
                        return label;
                    }
                }
            }
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">Dashboard</h2>
                    <p className="page-subtitle">Visão consolidada do esforço da equipe.</p>
                </div>

                <div className="flex items-center gap-4 bg-white px-4 py-2 hover:shadow-sm rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-gray-800 capitalize w-40 text-center select-none">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            {totalMonthHours === 0 ? (
                <div className="card text-center py-20 animate-in fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100/50 text-gray-400 mb-4">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Sem Dados no Mês</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Não há horas registradas de projetos ou equipe ativa para este período. Vá para a aba "Registro de Horas" para lançar apontamentos.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">
                        <div className="card h-[460px] flex flex-col animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-2 mb-6 text-gray-800">
                                <BarChart3 className="text-primary" size={24} />
                                <h3 className="text-lg font-semibold tracking-tight">Horas por Arquiteto e Projeto</h3>
                            </div>
                            <div className="flex-1 w-full relative">
                                <Bar data={barData} options={barOptions} />
                            </div>
                        </div>

                        <div className="card bg-gradient-to-br from-primary to-primary-dark border-transparent text-white animate-in fade-in slide-in-from-bottom-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-primary-light font-medium text-sm uppercase tracking-wider mb-1">Total do Mês</h3>
                                    <div className="text-5xl font-bold tracking-tight">{totalMonthHours} <span className="text-2xl font-medium text-primary-light">horas</span></div>
                                </div>
                                <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <BarChart3 size={32} className="text-white/80" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card h-[460px] flex flex-col animate-in fade-in slide-in-from-bottom-8">
                        <div className="flex items-center gap-2 mb-6 text-gray-800">
                            <PieChart className="text-primary" size={24} />
                            <h3 className="text-lg font-semibold tracking-tight">Distribuição de Esforço</h3>
                        </div>
                        <div className="flex-1 w-full relative flex items-center justify-center">
                            <div className="w-full max-w-[280px] h-full">
                                <Pie data={pieData} options={pieOptions} />
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
