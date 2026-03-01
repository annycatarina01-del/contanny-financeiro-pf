import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { AuthService } from '../modules/auth/auth.service';
import { User, Session } from '@supabase/supabase-js';

interface Organization {
    id: string;
    name: string;
}

interface AuthContextData {
    user: User | null;
    organization: Organization | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = async () => {
        try {
            setLoading(true);
            const data = await AuthService.getCurrentSession();
            if (data) {
                setUser(data.user);
                setSession(data.session);
                setOrganization(data.organization as any);
            } else {
                setUser(null);
                setSession(null);
                setOrganization(null);
            }
        } catch (error) {
            console.error('Error refreshing session:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                setTimeout(() => refreshSession(), 500);
            } else {
                setUser(null);
                setSession(null);
                setOrganization(null);
                setLoading(false);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await AuthService.signOut();
        setUser(null);
        setSession(null);
        setOrganization(null);
    };

    return (
        <AuthContext.Provider value={{ user, organization, session, loading, signOut, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
