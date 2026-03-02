import { supabase } from "../../lib/supabase";
import { MonthlyGoal, CreateGoalDTO, UpdateGoalDTO, EvaluateGoalDTO } from "./metas.types";

export const MetasService = {
  async getByMonth(orgId: string, month: string): Promise<MonthlyGoal | null> {
    const { data, error } = await supabase
      .from("monthly_goals")
      .select("*")
      .eq("organization_id", orgId)
      .eq("month", month)
      .maybeSingle();

    if (error) throw error;
    return data as MonthlyGoal;
  },

  async create(orgId: string, data: CreateGoalDTO): Promise<{ id: string }> {
    const { data: goal, error } = await supabase
      .from("monthly_goals")
      .insert({
        organization_id: orgId,
        month: data.month,
        name: data.name,
        essential_percent: data.essentialPercent,
        leisure_percent: data.leisurePercent,
        investment_percent: data.investmentPercent,
      })
      .select()
      .single();

    if (error) throw error;
    return { id: goal.id };
  },

  async update(orgId: string, id: string, data: UpdateGoalDTO): Promise<void> {
    const { error } = await supabase
      .from("monthly_goals")
      .update({
        name: data.name,
        essential_percent: data.essentialPercent,
        leisure_percent: data.leisurePercent,
        investment_percent: data.investmentPercent,
      })
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;
  },

  async evaluate(orgId: string, id: string, data: EvaluateGoalDTO): Promise<void> {
    const { error } = await supabase
      .from("monthly_goals")
      .update({
        achieved: data.achieved,
        reason: data.reason,
      })
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;
  },

  async delete(orgId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from("monthly_goals")
      .delete()
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;
  }
};
