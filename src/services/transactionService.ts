import { supabase } from "../lib/supabase";

export interface Transaction {
    id: string;
    organization_id: string;
    account_id: string;
    entry_id?: string;
    description: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer_in' | 'transfer_out';
    category: string;
    date: string;
    created_at: string;
}

export interface CreateTransactionDTO {
    accountId: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

export const TransactionService = {
    async getAll(orgId: string): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from("financial_transactions")
            .select("*")
            .eq("organization_id", orgId)
            .order("date", { ascending: false });

        if (error) throw error;
        return data as Transaction[];
    },

    async create(orgId: string, data: CreateTransactionDTO): Promise<void> {
        // We must ensure amount is negative for expenses if not already
        const signedAmount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);

        const { error } = await supabase.rpc('process_transaction', {
            p_org_id: orgId,
            p_account_id: data.accountId,
            p_description: data.description,
            p_amount: signedAmount,
            p_type: data.type,
            p_category: data.category,
            p_date: data.date
        });

        if (error) throw error;
    },

    async delete(orgId: string, id: string): Promise<void> {
        // Note: Deleting a transaction should ideally be an annulment/offset, 
        // but the current system allows deletion. 
        // For a simple migration, we'll allow it but warn that it breaks the balance history.
        // Better: Implement a "revert_transaction" RPC.

        // For now, let's just delete and let the user know.
        const { error } = await supabase
            .from("financial_transactions")
            .delete()
            .eq("id", id)
            .eq("organization_id", orgId);

        if (error) throw error;
    }
};
