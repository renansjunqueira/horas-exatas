import { useState, createContext, useContext, useEffect } from 'react';

// Create the context
const AppContext = createContext();

// Create a custom hook for easy access
export const useAppContext = () => useContext(AppContext);

// Initial mock data
const initialProjects = [
    { id: 1, name: 'Residência Silva', startDate: '2023-11-01', status: 'Ativo' },
    { id: 2, name: 'Edifício Infinity', startDate: '2024-01-15', status: 'Ativo' },
    { id: 3, name: 'Reforma Comercial Centro', startDate: '2024-02-10', status: 'Inativo' },
];

const initialArchitects = [
    { id: 1, name: 'Ana Costa' },
    { id: 2, name: 'Carlos Pereira' },
    { id: 3, name: 'Beatriz Almeida' },
];

// Mock hours data: { "yyyy-mm-dd": { architectId: { projectId: hours } } }
const initialHours = {
    '2024-02-26': {
        1: { 1: 4, 2: 4 }, // Ana worked 4h on Project 1 and 4h on Project 2
        2: { 2: 8 }        // Carlos worked 8h on Project 2
    }
};

export const AppProvider = ({ children }) => {
    // Try to load from localStorage first, else use mock
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem('horas_exatas_projects');
        return saved ? JSON.parse(saved) : initialProjects;
    });

    const [architects, setArchitects] = useState(() => {
        const saved = localStorage.getItem('horas_exatas_architects');
        return saved ? JSON.parse(saved) : initialArchitects;
    });

    const [hoursLog, setHoursLog] = useState(() => {
        const saved = localStorage.getItem('horas_exatas_hours');
        let parsed = saved ? JSON.parse(saved) : initialHours;

        let changed = false;

        // One-time migration to rescue "Casa Uva" hours that were saving under deleted Project IDs
        Object.keys(parsed).forEach(date => {
            Object.keys(parsed[date]).forEach(arch => {
                const logs = parsed[date][arch];
                if (logs["1"]) {
                    logs["1772214122148"] = (logs["1772214122148"] || 0) + logs["1"];
                    delete logs["1"];
                    changed = true;
                }
                if (logs["1772212705262"]) {
                    logs["1772214122148"] = (logs["1772214122148"] || 0) + logs["1772212705262"];
                    delete logs["1772212705262"];
                    changed = true;
                }
            });
        });

        if (changed) {
            localStorage.setItem('horas_exatas_hours', JSON.stringify(parsed));
        }

        return parsed;
    });

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('horas_exatas_projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('horas_exatas_architects', JSON.stringify(architects));
    }, [architects]);

    useEffect(() => {
        localStorage.setItem('horas_exatas_hours', JSON.stringify(hoursLog));
    }, [hoursLog]);

    // Handlers for Projects
    const addProject = (project) => {
        setProjects(prev => [...prev, { ...project, id: Date.now() }]);
    };

    const updateProjectStatus = (id, newStatus) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    };

    const updateProject = (id, updatedData) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    };

    const deleteProject = (id) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        // You might want to also cleanup hoursLog related to this project, 
        // but for a simple prototype we can leave it or handle it separately if required
    };

    // Handlers for Team
    const addArchitect = (name) => {
        setArchitects(prev => [...prev, { id: Date.now(), name }]);
    };

    const updateArchitect = (id, newName) => {
        setArchitects(prev => prev.map(a => a.id === id ? { ...a, name: newName } : a));
    };

    const deleteArchitect = (id) => {
        setArchitects(prev => prev.filter(a => a.id !== id));
    };

    // Handlers for Time Logging
    const logHours = (dateStr, architectId, projectId, hoursCount) => {
        setHoursLog(prev => {
            const newLog = { ...prev };

            // Ensure date entry exists
            if (!newLog[dateStr]) newLog[dateStr] = {};

            // Ensure architect entry exists
            if (!newLog[dateStr][architectId]) newLog[dateStr][architectId] = {};

            // Update hours
            newLog[dateStr][architectId][projectId] = parseFloat(hoursCount) || 0;

            // Cleanup if 0
            if (newLog[dateStr][architectId][projectId] === 0) {
                delete newLog[dateStr][architectId][projectId];
            }

            return newLog;
        });
    };

    const removeRowHours = (yearMonth, architectId, projectId) => {
        setHoursLog(prev => {
            const newLog = { ...prev };

            // Loop through all days in the month and remove the entry for this architect/project
            Object.keys(newLog).forEach(dateStr => {
                if (dateStr.startsWith(yearMonth)) {
                    if (newLog[dateStr][architectId] && newLog[dateStr][architectId][projectId] !== undefined) {
                        delete newLog[dateStr][architectId][projectId];

                        // Cleanup empty objects
                        if (Object.keys(newLog[dateStr][architectId]).length === 0) {
                            delete newLog[dateStr][architectId];
                        }
                    }
                }
            });

            return newLog;
        });
    };

    const value = {
        projects,
        addProject,
        updateProjectStatus,
        updateProject,
        deleteProject,
        architects,
        addArchitect,
        updateArchitect,
        deleteArchitect,
        hoursLog,
        logHours,
        removeRowHours
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
