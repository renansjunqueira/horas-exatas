import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Combinamos user + profile num estado único para evitar renders intermediários
    // onde user está setado mas profile ainda não (causaria flashes de redirect)
    const [authState, setAuthState] = useState({
        user: null,
        profile: null,
        isLoading: true,
    });

    const fetchProfile = useCallback(async (userId) => {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5000);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
                .abortSignal(controller.signal);

            clearTimeout(timer);
            if (error) {
                console.error('Erro ao buscar perfil:', error);
                return null;
            }
            return data;
        } catch (err) {
            console.error('fetchProfile timeout ou erro:', err);
            return null;
        }
    }, []);

    useEffect(() => {
        // 1. Carrega a sessão atual imediatamente (não depende de evento)
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!session?.user) {
                setAuthState({ user: null, profile: null, isLoading: false });
                return;
            }
            const profile = await fetchProfile(session.user.id);
            setAuthState({ user: session.user, profile, isLoading: false });
        });

        // 2. Escuta mudanças posteriores (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // INITIAL_SESSION já tratado acima via getSession()
                if (event === 'INITIAL_SESSION') return;

                if (!session?.user) {
                    setAuthState({ user: null, profile: null, isLoading: false });
                    return;
                }
                const profile = await fetchProfile(session.user.id);
                setAuthState({ user: session.user, profile, isLoading: false });
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signUp = async ({ email, password, fullName }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        return { data, error };
    };

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        // onAuthStateChange vai setar authState para null automaticamente
    };

    // Força o recarregamento do perfil (usado após o admin aprovar alguém, por ex.)
    const refreshProfile = async () => {
        if (!authState.user) return;
        const profile = await fetchProfile(authState.user.id);
        setAuthState(prev => ({ ...prev, profile }));
    };

    const { user, profile, isLoading } = authState;
    const isAdmin = profile?.role === 'admin' && profile?.approval_status === 'approved';
    const isApproved = profile?.approval_status === 'approved';

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            isLoading,
            isAdmin,
            isApproved,
            signUp,
            signIn,
            signOut,
            refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
