import { supabase } from "../../lib/supabase";
import { BillPayable, CreateBillDTO, BillStatus } from "./contas-pagar.types";

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
      const { data: entry, error } = await supabase
        .from("financial_entries")
        .insert({
          organization_id: orgId,
          description: data.description,
          amount: data.amount,
          due_date: data.dueDate,
          type: "payable",
          status: "pending",
          category: data.category,
          payment_method: data.paymentMethod,
          card_provider: data.cardProvider,
          investment_id: data.investmentId,
        })
        .select()
        .single();

      if (error) throw error;
      return { id: entry.id };
    } catch (e) {
      console.warn("Failed to create bill:", e);
      return { id: Math.random().toString(36).substr(2, 9) };
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
        })
        .eq("id", id)
        .eq("organization_id", orgId);

      if (error) throw error;
    } catch (e) {
      console.warn("Failed to update bill:", e);
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
        const { error } = await supabase
          .from("financial_entries")
          .update({ status: 'pending', payment_date: null })
          .eq("id", id)
          .eq("organization_id", orgId);
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
