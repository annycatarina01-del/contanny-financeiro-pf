import { supabase } from "../../lib/supabase";
import { BillReceivable, CreateReceivableDTO, ReceivableStatus } from "./contas-receber.types";

export const ContasReceberService = {
  async getAll(orgId: string): Promise<BillReceivable[]> {
    const { data, error } = await supabase
      .from("financial_entries")
      .select("*")
      .eq("organization_id", orgId)
      .eq("type", "receivable")
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data as any[];
  },

  async create(orgId: string, data: CreateReceivableDTO): Promise<{ id: string }> {
    const { data: entry, error } = await supabase
      .from("financial_entries")
      .insert({
        organization_id: orgId,
        description: data.description,
        amount: data.amount,
        due_date: data.dueDate,
        type: "receivable",
        status: "pending",
        category: data.category,
        payment_method: data.paymentMethod,
      })
      .select()
      .single();

    if (error) throw error;
    return { id: entry.id };
  },

  async update(orgId: string, id: string, data: Partial<CreateReceivableDTO>): Promise<void> {
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
  },

  async updateStatus(orgId: string, id: string, accountId: string, status: ReceivableStatus, paymentDate?: string): Promise<void> {
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
      const { error } = await supabase
        .from("financial_entries")
        .update({ status: 'pending', payment_date: null })
        .eq("id", id)
        .eq("organization_id", orgId);
      if (error) throw error;
    }
  },

  async delete(orgId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from("financial_entries")
      .delete()
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;
  }
};
