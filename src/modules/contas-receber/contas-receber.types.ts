export type ReceivableStatus = 'pending' | 'received';
export type PaymentMethod = 'boleto' | 'pix' | 'transfer' | 'cash' | 'other';

export interface BillReceivable {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  due_date: string;
  status: ReceivableStatus;
  category: string;
  payment_method: PaymentMethod;
  payment_date?: string;
  created_at: string;
  installment_number?: number;
  total_installments?: number;
}

export interface UpdateReceivableDTO {
  description?: string;
  amount?: number;
  dueDate?: string;
  category?: string;
  paymentMethod?: PaymentMethod;
}

export interface CreateReceivableDTO {
  description: string;
  secondaryDescription?: string;
  amount: number;
  dueDate: string;
  category: string;
  paymentMethod: PaymentMethod;
  isRepeated?: boolean;
  months?: number;
  installments?: number;
  paidInstallments?: number;
}
