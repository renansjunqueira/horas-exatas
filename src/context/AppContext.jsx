import { useState, createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [architects, setArchitects] = useState([]);
    const [hoursLog, setHoursLog] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Projects
            const { data: projData, error: projErr } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
            if (projErr) throw projErr;

            // Map DB column names to frontend state names
            const mappedProjects = (projData || []).map(p => ({
                id: p.id,
                name: p.name,
                startDate: p.start_date,
                status: p.status
            }));
            setProjects(mappedProjects);

            // Fetch Architects
            const { data: archData, error: archErr } = await supabase.from('architects').select('*').order('created_at', { ascending: true });
            if (archErr) throw archErr;
            setArchitects(archData || []);

            // Fetch Hours Log
            const { data: logData, error: logErr } = await supabase.from('hours_log').select('*');
            if (logErr) throw logErr;

            // Transform relational data into nested object: { "yyyy-mm-dd": { archId: { projId: hours } } }
            const parsedHours = {};
            (logData || []).forEach(record => {
                const { log_date, architect_id, project_id, hours } = record;
                if (!parsedHours[log_date]) parsedHours[log_date] = {};
                if (!parsedHours[log_date][architect_id]) parsedHours[log_date][architect_id] = {};
                parsedHours[log_date][architect_id][project_id] = parseFloat(hours);
            });
            setHoursLog(parsedHours);

        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers for Projects
    const addProject = async (project) => {
        const { data, error } = await supabase
            .from('projects')
            .insert([{ name: project.name, start_date: project.startDate, status: project.status }])
            .select();

        if (error) {
            console.error('Error adding project:', error);
            return;
        }

        if (data && data[0]) {
            setProjects(prev => [...prev, {
                id: data[0].id,
                name: data[0].name,
                startDate: data[0].start_date,
                status: data[0].status
            }]);
        }
    };

    const updateProjectStatus = async (id, newStatus) => {
        const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', id);
        if (error) {
            console.error('Error updating project status:', error);
            return;
        }
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    };

    const updateProject = async (id, updatedData) => {
        const { error } = await supabase.from('projects').update({
            name: updatedData.name,
            start_date: updatedData.startDate,
            status: updatedData.status
        }).eq('id', id);

        if (error) {
            console.error('Error updating project:', error);
            return;
        }
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    };

    const deleteProject = async (id) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) {
            console.error('Error deleting project:', error);
            return;
        }
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    // Handlers for Team
    const addArchitect = async (name) => {
        const { data, error } = await supabase.from('architects').insert([{ name }]).select();
        if (error) {
            console.error('Error adding architect:', error);
            return;
        }
        if (data && data[0]) {
            setArchitects(prev => [...prev, data[0]]);
        }
    };

    const updateArchitect = async (id, newName) => {
        const { error } = await supabase.from('architects').update({ name: newName }).eq('id', id);
        if (error) {
            console.error('Error updating architect:', error);
            return;
        }
        setArchitects(prev => prev.map(a => a.id === id ? { ...a, name: newName } : a));
    };

    const deleteArchitect = async (id) => {
        const { error } = await supabase.from('architects').delete().eq('id', id);
        if (error) {
            console.error('Error deleting architect:', error);
            return;
        }
        setArchitects(prev => prev.filter(a => a.id !== id));
    };

    // Handlers for Time Logging
    const logHours = async (dateStr, architectId, projectId, hoursCount) => {
        const numHours = parseFloat(hoursCount);

        // Optimistic UI update
        setHoursLog(prev => {
            const newLog = { ...prev };
            if (!newLog[dateStr]) newLog[dateStr] = {};
            if (!newLog[dateStr][architectId]) newLog[dateStr][architectId] = {};

            newLog[dateStr][architectId][projectId] = numHours || 0;

            if (numHours === 0 || isNaN(numHours)) {
                delete newLog[dateStr][architectId][projectId];
                if (Object.keys(newLog[dateStr][architectId]).length === 0) {
                    delete newLog[dateStr][architectId];
                }
            }
            return newLog;
        });

        if (numHours === 0 || isNaN(numHours)) {
            // Delete from DB
            await supabase.from('hours_log').delete().match({
                log_date: dateStr,
                architect_id: architectId,
                project_id: projectId
            });
        } else {
            // Upsert in DB
            await supabase.from('hours_log').upsert({
                log_date: dateStr,
                architect_id: architectId,
                project_id: projectId,
                hours: numHours
            }, { onConflict: 'log_date, architect_id, project_id' });
        }
    };

    const removeRowHours = async (yearMonth, architectId, projectId) => {
        // Optimistic UI Update
        setHoursLog(prev => {
            const newLog = { ...prev };
            Object.keys(newLog).forEach(dateStr => {
                if (dateStr.startsWith(yearMonth)) {
                    if (newLog[dateStr][architectId] && newLog[dateStr][architectId][projectId] !== undefined) {
                        delete newLog[dateStr][architectId][projectId];
                        if (Object.keys(newLog[dateStr][architectId]).length === 0) {
                            delete newLog[dateStr][architectId];
                        }
                    }
                }
            });
            return newLog;
        });

        // DB Deletion
        const startDate = `${yearMonth}-01`;
        const [year, month] = yearMonth.split('-');
        const endDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const endDate = `${yearMonth}-${endDay}`;

        await supabase.from('hours_log')
            .delete()
            .eq('architect_id', architectId)
            .eq('project_id', projectId)
            .gte('log_date', startDate)
            .lte('log_date', endDate);
    };

    const value = {
        isLoading,
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
