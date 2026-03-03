import { supabase } from "../../lib/supabase";
import { BillReceivable, CreateReceivableDTO, ReceivableStatus } from "./contas-receber.types";
import { addMonths, format } from "date-fns";

export const ContasReceberService = {
  async getAll(orgId: string): Promise<BillReceivable[]> {
    try {
      const { data, error } = await supabase
        .from("financial_entries")
        .select("*")
        .eq("organization_id", orgId)
        .eq("type", "receivable")
        .order("due_date", { ascending: true });

      if (error) {
        console.warn("Error fetching receivables:", error);
        return [];
      }
      return data as any[];
    } catch (e) {
      console.warn("Failed to fetch receivables:", e);
      return [];
    }
  },

  async create(orgId: string, data: CreateReceivableDTO): Promise<{ id: string }> {
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
        const baseCents = Math.floor((data.amount / installments) * 100);
        baseAmount = baseCents / 100;
        const totalBaseCents = baseCents * (installments - 1);
        firstInstallmentAmount = (Math.round(data.amount * 100) - totalBaseCents) / 100;
      }

      for (let i = 1; i <= totalEntries; i++) {
        // Create date explicitly to avoid timezone issues
        // new Date(year, month-1, day) is local time, which is usually what user expects for "day of month"
        let installmentDateObj = addMonths(new Date(year, month - 1, day), i - 1);
        const installmentDate = format(installmentDateObj, 'yyyy-MM-dd');

        const isPaid = i <= (data.paidInstallments || 0);
        const currentAmount = i === 1 ? firstInstallmentAmount : baseAmount;

        entries.push({
          organization_id: orgId,
          description: data.description,
          amount: currentAmount,
          due_date: installmentDate,
          type: "receivable",
          status: isPaid ? "received" : "pending",
          category: data.category,
          payment_method: data.paymentMethod,
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
        console.error("Supabase error creating receivable:", error);
        throw error;
      }
      return { id: created?.[0]?.id || Math.random().toString(36).substr(2, 9) };
    } catch (e) {
      console.error("Failed to create receivable:", e);
      throw e;
    }
  },

  async update(orgId: string, id: string, data: Partial<CreateReceivableDTO>): Promise<void> {
    try {
      const { error } = await supabase
        .from("financial_entries")
        .update({
          description: data.description,
          amount: data.amount,
          due_date: data.dueDate,
          category: data.category,
          payment_method: data.paymentMethod,
        })
        .eq("id", id)
        .eq("organization_id", orgId);

      if (error) throw error;
    } catch (e) {
      console.warn("Failed to update receivable:", e);
    }
  },

  async updateStatus(orgId: string, id: string, accountId: string, status: ReceivableStatus, paymentDate?: string): Promise<void> {
    try {
      if (status === 'received') {
        const { error } = await supabase.rpc('process_entry_payment', {
          p_org_id: orgId,
          p_entry_id: id,
          p_account_id: accountId,
          p_amount: 0,
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
      console.warn("Failed to update receivable status:", e);
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
      console.warn("Failed to delete receivable:", e);
    }
  }
};
