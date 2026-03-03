import { supabase } from "../../lib/supabase";
import { Investment, CreateInvestmentDTO, UpdateInvestmentDTO } from "./investimentos.types";

export const InvestimentosService = {
  async getAll(orgId: string): Promise<Investment[]> {
    const { data: investments, error: invError } = await supabase
      .from("investments")
      .select("*")
      .eq("organization_id", orgId)
      .order("purchase_date", { ascending: false });

    if (invError) throw invError;

    // Fetch pending payables linked to investments
    const { data: payables, error: payError } = await supabase
      .from("financial_entries")
      .select("amount, investment_id")
      .eq("organization_id", orgId)
      .eq("type", "payable")
      .eq("status", "pending")
      .not("investment_id", "is", null);

    if (payError) {
      console.warn("Error fetching linked payables:", payError);
      return investments as Investment[];
    }

    // Map total_linked_payable to each investment
    return (investments as Investment[]).map(inv => {
      const total = (payables || [])
        .filter(p => p.investment_id === inv.id)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        ...inv,
        total_linked_payable: total
      };
    });
  },

  async create(orgId: string, data: CreateInvestmentDTO): Promise<{ id: string }> {
    const { data: inv, error } = await supabase
      .from("investments")
      .insert({
        organization_id: orgId,
        name: data.name,
        type: data.type,
        amount_invested: data.amountInvested,
        current_value: data.currentValue,
        purchase_date: data.purchaseDate,
      })
      .select()
      .single();

    if (error) throw error;
    return { id: inv.id };
  },

  async update(orgId: string, id: string, data: UpdateInvestmentDTO): Promise<void> {
    const { error } = await supabase
      .from("investments")
      .update({
        name: data.name,
        type: data.type,
        amount_invested: data.amountInvested,
        current_value: data.currentValue,
        purchase_date: data.purchaseDate,
      })
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;
  },

  async delete(orgId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;
  },

  async redeem(orgId: string, accountId: string, id: string, amount: number, date: string): Promise<void> {
    // Ideally use an RPC for atomic redeem + transaction
    // For now, we'll implement it as multiple operations or assume transaction security
    const { error: updateError } = await supabase
      .from("investments")
      .update({ current_value: supabase.rpc('decrement', { amount }) as any }) // This is a bit complex in pure JS without RPC
      .eq("id", id)
      .eq("organization_id", orgId);

    // Better: We should have an RPC 'redeem_investment' in the DB.
    // I already have process_transaction.

    const { error: transError } = await supabase.rpc('process_transaction', {
      p_org_id: orgId,
      p_account_id: accountId,
      p_description: `Resgate de investimento`,
      p_amount: amount,
      p_type: 'income',
      p_category: 'Investimentos',
      p_date: date
    });

    if (transError) throw transError;

    // Update investment value (subtract from both current_value and amount_invested)
    const { data: inv } = await supabase.from('investments').select('current_value, amount_invested').eq('id', id).single();
    if (inv) {
      await supabase.from('investments').update({
        current_value: Number(inv.current_value) - amount,
        amount_invested: Number(inv.amount_invested) - amount
      }).eq('id', id);
    }
  }
};
