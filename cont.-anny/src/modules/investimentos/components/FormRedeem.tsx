import React, { useState } from "react";
import { Investment } from "../investimentos.types";
import { X } from "lucide-react";
import { Account } from "../../../services/accountService";

interface FormRedeemProps {
  investment: Investment;
  accounts: Account[];
  onRedeem: (id: string, accountId: string, amount: number, date: string) => void;
  onClose: () => void;
}

export function FormRedeem({ investment, accounts, onRedeem, onClose }: FormRedeemProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.length > 0 ? accounts[0].id : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !selectedAccountId) return;

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      alert("O valor do resgate deve ser maior que zero.");
      return;
    }

    if (numAmount > investment.current_value) {
      alert("O valor do resgate não pode ser maior que o valor atual do investimento.");
      return;
    }

    onRedeem(investment.id, selectedAccountId, numAmount, date);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">Resgatar Investimento</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 mb-4">
            <p className="text-sm text-zinc-500 mb-1">Investimento: <span className="font-semibold text-zinc-900">{investment.name}</span></p>
            <p className="text-sm text-zinc-500">Valor Atual: <span className="font-semibold text-zinc-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investment.current_value)}</span></p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Conta de Destino</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (Saldo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Valor do Resgate</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                max={investment.current_value}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Data do Resgate</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg mt-4"
          >
            Confirmar Resgate
          </button>
        </form>
      </div>
    </div>
  );
}
