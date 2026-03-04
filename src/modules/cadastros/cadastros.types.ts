export type OptionType = 'expense_category' | 'income_category' | 'payment_method' | 'credit_card' | 'funding_source';

export interface AppOption {
  id: string;
  user_id: string;
  type: OptionType;
  label: string;
  value: string;
  metadata?: { expense_type?: string } | Record<string, any>;
  created_at: string;
}

export interface CreateOptionDTO {
  type: OptionType;
  label: string;
  value: string;
  metadata?: { expense_type?: string } | Record<string, any>;
}

export interface UpdateOptionDTO {
  label?: string;
  value?: string;
  metadata?: { expense_type?: string } | Record<string, any>;
}
