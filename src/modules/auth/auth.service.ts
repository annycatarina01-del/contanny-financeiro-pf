import { supabase } from "../../lib/supabase";

export const AuthService = {
    async signUp(email: string, password: string, name: string) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (authError) throw authError;
        return { user: authData.user };
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Fetch all organizations the user is a member of
        const { data: members, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id, role, organizations(id, name)')
            .eq('user_id', data.user.id);

        if (memberError) throw memberError;

        const organizations = members?.map((m: any) => ({
            ...m.organizations,
            role: m.role
        })) || [];

        return {
            user: data.user,
            organizations
        };
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) return null;

        const { data: members, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id, role, organizations(id, name)')
            .eq('user_id', session.user.id);

        if (memberError) {
            console.error('Error fetching organization memberships:', memberError);
        }

        const organizations = members?.map((m: any) => ({
            ...m.organizations,
            role: m.role
        })) || [];

        return {
            session,
            user: session.user,
            organizations
        };
    }
};
