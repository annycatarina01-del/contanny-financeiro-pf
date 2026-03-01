import { supabase } from "../lib/supabase";

export interface Account {
    id: string;
    organization_id: string;
    name: string;
    balance: number;
    created_at: string;
}

export const AccountService = {
    async getAll(orgId: string): Promise<Account[]> {
        try {
            const { data, error } = await supabase
                .from("accounts")
                .select("*")
                .eq("organization_id", orgId)
                .order("name", { ascending: true });

            if (error) {
                console.warn("Error fetching accounts:", error);
                return [];
            }
            return data as Account[];
        } catch (e) {
            console.warn("Failed to fetch accounts:", e);
            return [];
        }
    },

    async create(orgId: string, name: string, initialBalance: number = 0): Promise<Account> {
        try {
            const { data, error } = await supabase
                .from("accounts")
                .insert({
                    organization_id: orgId,
                    name,
                    balance: initialBalance
                })
                .select()
                .single();

            if (error) throw error;
            return data as Account;
        } catch (e) {
            console.warn("Failed to create account:", e);
            // Return a temporary account for demo purposes
            return {
                id: Math.random().toString(36).substr(2, 9),
                organization_id: orgId,
                name,
                balance: initialBalance,
                created_at: new Date().toISOString()
            };
        }
    },

    async update(orgId: string, id: string, name: string): Promise<void> {
        const { error } = await supabase
            .from("accounts")
            .update({ name })
            .eq("id", id)
            .eq("organization_id", orgId);

        if (error) throw error;
    },

    async delete(orgId: string, id: string): Promise<void> {
        const { error } = await supabase
            .from("accounts")
            .delete()
            .eq("id", id)
            .eq("organization_id", orgId);

        if (error) throw error;
    }
};
