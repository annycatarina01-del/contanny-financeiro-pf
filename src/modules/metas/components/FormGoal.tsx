import React, { useState, useEffect } from "react";
import { MonthlyGoal, CreateGoalDTO, UpdateGoalDTO } from "../metas.types";
import { X } from "lucide-react";

interface FormGoalProps {
  month: string;
  goal: MonthlyGoal | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

export function FormGoal({ month, goal, onSave, onClose }: FormGoalProps) {
  const [name, setName] = useState(goal?.name || "Meta 50/30/20");
  const [essential, setEssential] = useState(goal?.essential_percent.toString() || "50");
  const [leisure, setLeisure] = useState(goal?.leisure_percent.toString() || "30");
  const [investment, setInvestment] = useState(goal?.investment_percent.toString() || "20");

  const total = parseInt(essential || "0") + parseInt(leisure || "0") + parseInt(investment || "0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (total !== 100) {
      alert("A soma das porcentagens deve ser exatamente 100%.");
      return;
    }

    onSave({
      month,
      name,
      essentialPercent: parseInt(essential),
      leisurePercent: parseInt(leisure),
      investmentPercent: parseInt(investment)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">{goal ? "Editar Meta" : "Criar Meta"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Nome da Meta</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div className="space-y-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Essencial (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={essential}
                onChange={(e) => setEssential(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
              <p className="text-xs text-zinc-400 ml-1">Moradia, Alimentação, Saúde, etc.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Lazer (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={leisure}
                onChange={(e) => setLeisure(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
              <p className="text-xs text-zinc-400 ml-1">Passeios, Hobbies, etc.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Investimentos/Reservas (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
              <p className="text-xs text-zinc-400 ml-1">Poupança, Ações, Renda Fixa, etc.</p>
            </div>
            
            <div className={`text-sm font-bold text-right ${total === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
              Total: {total}%
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-lg"
          >
            Salvar Meta
          </button>
        </form>
      </div>
    </div>
  );
}
