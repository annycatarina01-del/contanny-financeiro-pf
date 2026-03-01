import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not configured. Using mock client.');
    // Create a mock supabase client that doesn't throw errors
    supabase = {
        from: () => ({
            select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null })) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            update: () => ({ eq: () => Promise.resolve({ error: null }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        }),
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            signOut: () => Promise.resolve({ error: null }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        }
    };
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
