import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not configured. Using mock client.');

    // Mock query builder
    const mockQueryBuilder = {
        select: () => mockQueryBuilder,
        insert: () => mockQueryBuilder,
        update: () => mockQueryBuilder,
        delete: () => mockQueryBuilder,
        eq: () => mockQueryBuilder,
        order: () => mockQueryBuilder,
        single: () => Promise.resolve({ data: null, error: null }),
        then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
    };

    // Create a mock supabase client
    const configError = new Error('Supabase não configurado. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidos nas variáveis de ambiente do Vercel.');

    supabase = {
        from: () => mockQueryBuilder,
        rpc: () => Promise.resolve({ data: null, error: configError }),
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: () => Promise.resolve({ data: null, error: configError }),
            signUp: () => Promise.resolve({ data: null, error: configError }),
            signOut: () => Promise.resolve({ error: null }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        }
    };
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
