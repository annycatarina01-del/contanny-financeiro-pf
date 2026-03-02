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
    installment_number?: number;
    total_installments?: number;
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
        try {
            const { data, error } = await supabase
                .from("financial_transactions")
                .select(`
                    *,
                    financial_entries (
                        installment_number,
                        total_installments
                    )
                `)
                .eq("organization_id", orgId)
                .order("date", { ascending: false });

            if (error) {
                console.warn("Error fetching transactions:", error);
                return [];
            }

            // Flatten the related entry data
            const transactions = (data as any[]).map(t => ({
                ...t,
                installment_number: t.financial_entries?.installment_number,
                total_installments: t.financial_entries?.total_installments
            }));

            return transactions as Transaction[];
        } catch (e) {
            console.warn("Failed to fetch transactions:", e);
            return [];
        }
    },

    async create(orgId: string, data: CreateTransactionDTO): Promise<void> {
        try {
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

            if (error) console.warn("Error creating transaction:", error);
        } catch (e) {
            console.warn("Failed to create transaction:", e);
        }
    },

    async delete(orgId: string, id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from("financial_transactions")
                .delete()
                .eq("id", id)
                .eq("organization_id", orgId);

            if (error) console.warn("Error deleting transaction:", error);
        } catch (e) {
            console.warn("Failed to delete transaction:", e);
        }
    }
};
