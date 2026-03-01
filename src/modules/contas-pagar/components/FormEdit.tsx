import React, { useState, useEffect } from "react";
import { PaymentMethod, BillPayable } from "../contas-pagar.types";
import { InvestimentosService } from "../../investimentos/investimentos.service";
import { Investment } from "../../investimentos/investimentos.types";
import { X } from "lucide-react";
import { useOptions } from "../../../contexts/OptionsContext";

interface FormEditProps {
  bill: BillPayable;
  onUpdate: (id: string, data: any) => void;
  onClose: () => void;
}

export function FormEdit({ bill, onUpdate, onClose }: FormEditProps) {
  const { getOptionsByType } = useOptions();
  const expenseCategories = getOptionsByType('expense_category');
  const paymentMethods = getOptionsByType('payment_method');
  const creditCards = getOptionsByType('credit_card');
  const fundingSources = getOptionsByType('funding_source');

  const [description, setDescription] = useState(bill.description);
  const [secondaryDescription, setSecondaryDescription] = useState(bill.secondary_description || "");
  const [amount, setAmount] = useState(bill.amount.toString());
  const [dueDate, setDueDate] = useState(bill.due_date);
  const [category, setCategory] = useState(bill.category);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>(bill.payment_method);
  const [cardProvider, setCardProvider] = useState(bill.card_provider || "");
  const [investmentId, setInvestmentId] = useState(bill.investment_id || "");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [fundingSource, setFundingSource] = useState(
    bill.investment_id ? 'investment' : 'balance'
  );

  useEffect(() => {
    InvestimentosService.getAll().then(setInvestments).catch(console.error);
    if (creditCards.length > 0 && !cardProvider) setCardProvider(creditCards[0].value);
  }, [creditCards]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !dueDate || !category || !paymentMethod) return;

    let finalInvestmentId = undefined;
    if (paymentMethod === 'investment') {
      finalInvestmentId = investmentId;
    } else if (paymentMethod === 'credit_card' && fundingSource === 'investment') {
      finalInvestmentId = investmentId;
    }

    onUpdate(bill.id, {
      description,
      secondaryDescription: secondaryDescription || undefined,
      amount: parseFloat(amount),
      dueDate,
      category,
      paymentMethod,
      cardProvider: paymentMethod === 'credit_card' ? cardProvider : undefined,
      investmentId: finalInvestmentId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">Editar Conta</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Descrição Primária</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Internet..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Descrição Secundária (Opcional)</label>
              <input
                type="text"
                value={secondaryDescription}
                onChange={(e) => setSecondaryDescription(e.target.value)}
                placeholder="Ex: Detalhes adicionais..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
            </div>
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
                {expenseCategories.map(cat => (
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

          {paymentMethod === 'credit_card' && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Qual Cartão?</label>
                <select
                  value={cardProvider}
                  onChange={(e) => setCardProvider(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                >
                  {creditCards.map(provider => (
                    <option key={provider.id} value={provider.value}>{provider.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Fonte do Pagamento</label>
                <select
                  value={fundingSource}
                  onChange={(e) => setFundingSource(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                >
                  {fundingSources.map(source => (
                    <option key={source.id} value={source.value}>{source.label}</option>
                  ))}
                </select>
              </div>

              {fundingSource === 'investment' && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Qual Investimento?</label>
                  <select
                    value={investmentId}
                    onChange={(e) => setInvestmentId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                  >
                    <option value="">Selecione um investimento</option>
                    {investments.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.current_value)})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'investment' && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Qual Investimento?</label>
              <select
                value={investmentId}
                onChange={(e) => setInvestmentId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
              >
                <option value="">Selecione um investimento</option>
                {investments.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.current_value)})</option>
                ))}
              </select>
            </div>
          )}

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
