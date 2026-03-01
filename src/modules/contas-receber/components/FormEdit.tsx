import React, { useState } from "react";
import { PaymentMethod, BillReceivable } from "../contas-receber.types";
import { X } from "lucide-react";
import { useOptions } from "../../../contexts/OptionsContext";

interface FormEditProps {
  bill: BillReceivable;
  onUpdate: (id: string, data: any) => void;
  onClose: () => void;
}

export function FormEdit({ bill, onUpdate, onClose }: FormEditProps) {
  const { getOptionsByType } = useOptions();
  const incomeCategories = getOptionsByType('income_category');
  const paymentMethods = getOptionsByType('payment_method');

  const [description, setDescription] = useState(bill.description);
  const [amount, setAmount] = useState(bill.amount.toString());
  const [dueDate, setDueDate] = useState(bill.due_date);
  const [category, setCategory] = useState(bill.category);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>(bill.payment_method);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !dueDate || !category || !paymentMethod) return;

    onUpdate(bill.id, {
      description,
      amount: parseFloat(amount),
      dueDate,
      category,
      paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">Editar Conta a Receber</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salário, Venda..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Vencimento</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
              >
                {incomeCategories.map(cat => (
                  <option key={cat.id} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
              >
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-lg mt-4"
          >
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
}
