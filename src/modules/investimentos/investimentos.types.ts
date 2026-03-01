export type InvestmentType = 'fixed_income' | 'stock' | 'fii' | 'crypto' | 'fund' | 'other';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: InvestmentType;
  amount_invested: number;
  current_value: number;
  purchase_date: string;
  created_at: string;
  total_linked_payable?: number;
}

export interface CreateInvestmentDTO {
  name: string;
  type: InvestmentType;
  amountInvested: number;
  currentValue: number;
  purchaseDate: string;
}

export interface UpdateInvestmentDTO {
  name?: string;
  type?: InvestmentType;
  amountInvested?: number;
  currentValue?: number;
  purchaseDate?: string;
}

export const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'fixed_income', label: 'Renda Fixa' },
  { value: 'stock', label: 'Ações' },
  { value: 'fii', label: 'FIIs' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'fund', label: 'Fundos' },
  { value: 'other', label: 'Outros' },
];
