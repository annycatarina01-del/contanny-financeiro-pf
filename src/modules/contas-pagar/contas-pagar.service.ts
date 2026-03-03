import { supabase } from "../../lib/supabase";
import { BillPayable, CreateBillDTO, BillStatus } from "./contas-pagar.types";
import { addMonths, format } from "date-fns";

export const ContasPagarService = {
  async getAll(orgId: string): Promise<BillPayable[]> {
    try {
      const { data, error } = await supabase
        .from("financial_entries")
        .select("*")
        .eq("organization_id", orgId)
        .eq("type", "payable")
        .order("due_date", { ascending: true });

      if (error) {
        console.warn("Error fetching bills:", error);
        return [];
      }
      return data as any[];
    } catch (e) {
      console.warn("Failed to fetch bills:", e);
      return [];
    }
  },

  async create(orgId: string, data: CreateBillDTO): Promise<{ id: string }> {
    try {
      const installments = data.installments || 1;
      const repetitions = data.isRepeated ? (data.months || 1) : 1;
      const totalEntries = Math.max(installments, repetitions);

      const entries = [];
      const [year, month, day] = data.dueDate.split('-').map(Number);

      // Calculate amounts
      let baseAmount = data.amount;
      let firstInstallmentAmount = data.amount;

      if (installments > 1) {
        // Divide the total amount by installments, handle cents by rounding down the base
        const baseCents = Math.floor((data.amount / installments) * 100);
        baseAmount = baseCents / 100;
        // The first installment takes the remainder to ensure sum equals exactly data.amount
        const totalBaseCents = baseCents * (installments - 1);
        firstInstallmentAmount = (Math.round(data.amount * 100) - totalBaseCents) / 100;
      }

      for (let i = 1; i <= totalEntries; i++) {
        // Create base date for each month to avoid cumulative shifts
        let installmentDateObj = addMonths(new Date(year, month - 1, day), i - 1);
        const installmentDate = format(installmentDateObj, 'yyyy-MM-dd');

        const isPaid = i <= (data.paidInstallments || 0);
        const currentAmount = i === 1 ? firstInstallmentAmount : baseAmount;

        entries.push({
          organization_id: orgId,
          description: data.description,
          amount: currentAmount,
          due_date: installmentDate,
          type: "payable",
          status: isPaid ? "paid" : "pending",
          category: data.category,
          payment_method: data.paymentMethod,
          card_provider: data.cardProvider,
          investment_id: data.investmentId,
          installment_number: installments > 1 ? i : undefined,
          total_installments: installments > 1 ? installments : undefined,
          secondary_description: data.secondaryDescription,
          payment_date: isPaid ? installmentDate : undefined,
        });
      }

      const { data: created, error } = await supabase
        .from("financial_entries")
        .insert(entries)
        .select()
        .limit(1);

      if (error) {
        console.error("Supabase error creating bill:", error);
        throw error;
      }
      return { id: created?.[0]?.id || Math.random().toString(36).substr(2, 9) };
    } catch (e) {
      console.error("Failed to create bill:", e);
      throw e;
    }
  },

  async update(orgId: string, id: string, data: Partial<CreateBillDTO>): Promise<void> {
    try {
      const { error } = await supabase
        .from("financial_entries")
        .update({
          description: data.description,
          amount: data.amount,
          due_date: data.dueDate,
          category: data.category,
          payment_method: data.paymentMethod,
          card_provider: data.cardProvider,
          investment_id: data.investmentId,
          secondary_description: data.secondaryDescription,
        })
        .eq("id", id)
        .eq("organization_id", orgId);

      if (error) {
        console.error("Supabase error updating bill:", error);
        throw error;
      }
    } catch (e) {
      console.error("Failed to update bill:", e);
      throw e;
    }
  },

  async updateStatus(orgId: string, id: string, accountId: string, status: BillStatus, paymentDate?: string): Promise<void> {
    try {
      if (status === 'paid') {
        // Use RPC for atomic payment + transaction + account balance
        const { error } = await supabase.rpc('process_entry_payment', {
          p_org_id: orgId,
          p_entry_id: id,
          p_account_id: accountId,
          p_amount: 0, // RPC calculates amount from entry
          p_payment_date: paymentDate || new Date().toISOString().split('T')[0]
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('undo_entry_payment', {
          p_org_id: orgId,
          p_entry_id: id
        });
        if (error) throw error;
      }
    } catch (e) {
      console.warn("Failed to update bill status:", e);
    }
  },

  async delete(orgId: string, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("financial_entries")
        .delete()
        .eq("id", id)
        .eq("organization_id", orgId);

      if (error) throw error;
    } catch (e) {
      console.warn("Failed to delete bill:", e);
    }
  }
};
