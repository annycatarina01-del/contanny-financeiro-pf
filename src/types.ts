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
}

export interface Summary {
  balance: number;
  income: number;
  expenses: number;
}
