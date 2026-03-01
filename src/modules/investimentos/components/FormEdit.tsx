import React, { useState } from "react";
import { INVESTMENT_TYPES, Investment, InvestmentType } from "../investimentos.types";
import { X } from "lucide-react";

interface FormEditProps {
  investment: Investment;
  onUpdate: (id: string, data: any) => void;
  onClose: () => void;
}

export function FormEdit({ investment, onUpdate, onClose }: FormEditProps) {
  const [name, setName] = useState(investment.name);
  const [type, setType] = useState<InvestmentType>(investment.type);
  const [amountInvested, setAmountInvested] = useState(investment.amount_invested.toString());
  const [currentValue, setCurrentValue] = useState(investment.current_value.toString());
  const [purchaseDate, setPurchaseDate] = useState(investment.purchase_date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amountInvested || !purchaseDate) return;

    onUpdate(investment.id, {
      name,
      type,
      amountInvested: parseFloat(amountInvested),
      currentValue: parseFloat(currentValue),
      purchaseDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">Editar Investimento</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Nome do Ativo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tesouro Selic, PETR4..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InvestmentType)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
            >
              {INVESTMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Valor Investido</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountInvested}
                  onChange={(e) => setAmountInvested(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Valor Atual</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Data da Compra</label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
            />
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
