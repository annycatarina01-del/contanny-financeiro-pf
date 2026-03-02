export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number | string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  isFixed: boolean;
  paymentMethod?: string;
  cardProvider?: string;
  investmentId?: string;
  status?: 'pending' | 'paid' | 'received';
}

export interface Summary {
  realizedBalance: number;
  realizedIncome: number;
  realizedExpenses: number;
  projectedBalance: number;
  projectedIncome: number;
  projectedExpenses: number;
}
