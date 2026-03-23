import React, { useState, useEffect } from "react";
import { TransactionType } from "../types";
import { X } from "lucide-react";
import { useOptions } from "../contexts/OptionsContext";

interface TransactionFormProps {
  onAdd: (data: any) => void;
  onClose: () => void;
}

export function TransactionForm({ onAdd, onClose }: TransactionFormProps) {
  const { getOptionsByType } = useOptions();
  const expenseCategories = getOptionsByType('expense_category');
  const incomeCategories = getOptionsByType('income_category');

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFixed, setIsFixed] = useState(false);
  const [months, setMonths] = useState("1");

  useEffect(() => {
    if (type === 'expense' && expenseCategories.length > 0 && !category) {
      setCategory(expenseCategories[0].value);
    } else if (type === 'income' && incomeCategories.length > 0 && !category) {
      setCategory(incomeCategories[0].value);
    }
  }, [expenseCategories, incomeCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
      isFixed,
      months: isFixed ? parseInt(months) : 1
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">Nova Transação</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="flex p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(expenseCategories[0]?.value || ''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(incomeCategories[0]?.value || ''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Receita
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Salário..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                <option key={cat.id} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFixed"
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <label htmlFor="isFixed" className="text-sm font-medium text-zinc-700 cursor-pointer select-none">
                Esta é uma {type === 'income' ? 'receita' : 'despesa'} fixa mensal
              </label>
            </div>

            {isFixed && (
              <div className="space-y-1 mt-2 animate-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Repetir por quantos meses?</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-4 ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
          >
            Adicionar {type === 'income' ? 'Receita' : 'Despesa'}
          </button>
        </form>
      </div>
    </div>
  );
}
