import { supabase } from "../lib/supabase";

export const SeedService = {
    async seedDefaultOptions(orgId: string) {
        const defaults = [
            // Expense Categories
            { type: 'expense_category', label: 'Alimentação', value: 'Alimentação' },
            { type: 'expense_category', label: 'Transporte', value: 'Transporte' },
            { type: 'expense_category', label: 'Moradia', value: 'Moradia' },
            { type: 'expense_category', label: 'Saúde', value: 'Saúde' },
            { type: 'expense_category', label: 'Lazer', value: 'Lazer' },
            { type: 'expense_category', label: 'Educação', value: 'Educação' },
            { type: 'expense_category', label: 'Outros', value: 'Outros' },

            // Income Categories
            { type: 'income_category', label: 'Salário', value: 'Salário' },
            { type: 'income_category', label: 'Investimentos', value: 'Investimentos' },
            { type: 'income_category', label: 'Freelance', value: 'Freelance' },
            { type: 'income_category', label: 'Outros', value: 'Outros' },

            // Payment Methods
            { type: 'payment_method', label: 'PIX', value: 'pix' },
            { type: 'payment_method', label: 'Dinheiro', value: 'cash' },
            { type: 'payment_method', label: 'Transferência', value: 'transfer' },
            { type: 'payment_method', label: 'Cartão de Débito', value: 'debit_card' },
            { type: 'payment_method', label: 'Cartão de Crédito', value: 'credit_card' },
            { type: 'payment_method', label: 'Boleto', value: 'boleto' },

            // Credit Cards
            { type: 'credit_card', label: 'Nubank', value: 'Nubank' },
            { type: 'credit_card', label: 'Inter', value: 'Inter' },
            { type: 'credit_card', label: 'C6 Bank', value: 'C6 Bank' },
            { type: 'credit_card', label: 'Santander', value: 'Santander' },
            { type: 'credit_card', label: 'Bradesco', value: 'Bradesco' },
            { type: 'credit_card', label: 'Itaú', value: 'Itaú' },
            { type: 'credit_card', label: 'Outro', value: 'Outro' },

            // Funding Sources
            { type: 'funding_source', label: 'Saldo / Salário', value: 'balance' },
            { type: 'funding_source', label: 'Investimentos', value: 'investment' },
        ];

        const entries = defaults.map(d => ({
            ...d,
            organization_id: orgId
        }));

        const { error } = await supabase
            .from('app_options')
            .insert(entries);

        if (error) throw error;
    }
};
