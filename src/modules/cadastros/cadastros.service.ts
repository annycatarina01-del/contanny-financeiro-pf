import { supabase } from "../../lib/supabase";
import { AppOption, CreateOptionDTO, UpdateOptionDTO } from "./cadastros.types";

export const CadastrosService = {
  getAll: async (orgId?: string): Promise<AppOption[]> => {
    if (!orgId) {
      console.warn("CadastrosService.getAll called without orgId");
      return [];
    }
    
    const { data, error } = await supabase
      .from("app_options")
      .select("*")
      .eq("organization_id", orgId)
      .order("type", { ascending: true })
      .order("label", { ascending: true });

    if (error) {
      console.error("Error fetching options:", error);
      return [];
    }
    return data as AppOption[];
  },

  create: async (orgId: string, data: CreateOptionDTO): Promise<{ id: string }> => {
    const { data: option, error } = await supabase
      .from("app_options")
      .insert({
        organization_id: orgId,
        type: data.type,
        label: data.label,
        value: data.value,
      })
      .select()
      .single();

    if (error) throw error;
    return { id: option.id };
  },

  update: async (orgId: string, id: string, data: UpdateOptionDTO): Promise<void> => {
    const { error } = await supabase
      .from("app_options")
      .update({
        label: data.label,
        value: data.value,
      })
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;
  },

  delete: async (orgId: string, id: string): Promise<void> => {
    const { error } = await supabase
      .from("app_options")
      .delete()
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) throw error;
  }
};
