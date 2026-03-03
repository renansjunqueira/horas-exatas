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
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            console.error('Erro ao buscar perfil:', error);
            return null;
        }
        return data;
    }, []);

    useEffect(() => {
        // onAuthStateChange é chamado imediatamente com a sessão atual (INITIAL_SESSION)
        // e novamente em qualquer mudança posterior (login, logout, token refresh).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
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
