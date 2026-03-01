export type BillStatus = 'pending' | 'paid';
export type PaymentMethod = 'credit_card' | 'installments' | 'boleto' | 'investment';

export interface BillPayable {
  id: string;
  user_id: string;
  description: string;
  secondary_description?: string;
  amount: number;
  due_date: string;
  status: BillStatus;
  category: string;
  payment_method: PaymentMethod;
  card_provider?: string;
  investment_id?: string;
  payment_date?: string;
  created_at: string;
}

export interface UpdateBillDTO {
  description?: string;
  secondaryDescription?: string;
  amount?: number;
  dueDate?: string;
  category?: string;
  paymentMethod?: PaymentMethod;
  cardProvider?: string;
  investmentId?: string;
}

export interface CreateBillDTO {
  description: string;
  secondaryDescription?: string;
  amount: number;
  dueDate: string;
  category: string;
  paymentMethod: PaymentMethod;
  cardProvider?: string;
  investmentId?: string;
  isRepeated?: boolean;
  months?: number;
  installments?: number;
  sameDayDue?: boolean;
}
