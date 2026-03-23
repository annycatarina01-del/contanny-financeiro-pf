export type BillStatus = 'pending' | 'paid';
export type PaymentMethod = 'credit_card' | 'installments' | 'boleto' | 'investment' | 'investimentos' | string;

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
  funding_source?: string;
  payment_date?: string;
  created_at: string;
  installment_number?: number;
  total_installments?: number;
  parent_id?: string;
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
  fundingSource?: string;
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
  fundingSource?: string;
  isRepeated?: boolean;
  months?: number;
  installments?: number;
  paidInstallments?: number;
  sameDayDue?: boolean;
}

