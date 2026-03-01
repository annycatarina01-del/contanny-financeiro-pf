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

        if (authData.user) {
            // Create a default organization for the new user
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({ name: `Organização de ${name}` })
                .select()
                .single();

            if (orgError) throw orgError;

            // Add user as admin of the organization
            const { error: memberError } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: org.id,
                    user_id: authData.user.id,
                    role: 'admin',
                });

            if (memberError) throw memberError;

            return { user: authData.user, organization: org };
        }

        return { user: authData.user };
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Fetch the user's organization
        const { data: memberData, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id, organizations(id, name)')
            .eq('user_id', data.user.id)
            .single();

        if (memberError && memberError.code !== 'PGRST116') throw memberError;

        return {
            user: data.user,
            organization: memberData?.organizations
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

        const { data: memberData } = await supabase
            .from('organization_members')
            .select('organization_id, organizations(id, name)')
            .eq('user_id', session.user.id)
            .single();

        return {
            session,
            user: session.user,
            organization: memberData?.organizations
        };
    }
};
