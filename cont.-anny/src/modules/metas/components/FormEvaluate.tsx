import React, { useState } from "react";
import { MonthlyGoal } from "../metas.types";
import { X } from "lucide-react";

interface FormEvaluateProps {
  goal: MonthlyGoal;
  onEvaluate: (achieved: boolean, reason?: string) => void;
  onClose: () => void;
}

export function FormEvaluate({ goal, onEvaluate, onClose }: FormEvaluateProps) {
  const [achieved, setAchieved] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (achieved === null) return;
    onEvaluate(achieved, !achieved ? reason : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">Avaliar Meta</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 mb-4">
            <p className="text-sm text-zinc-500 mb-1">Meta: <span className="font-semibold text-zinc-900">{goal.name}</span></p>
            <p className="text-sm text-zinc-500">Mês: <span className="font-semibold text-zinc-900">{goal.month}</span></p>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-zinc-900 ml-1">Você conseguiu cumprir a meta neste mês?</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setAchieved(true)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${achieved === true ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'bg-white border-zinc-200 text-zinc-500 hover:border-emerald-200 hover:bg-emerald-50/50'}`}
              >
                Sim! 🎉
              </button>
              <button
                type="button"
                onClick={() => setAchieved(false)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${achieved === false ? 'bg-rose-50 border-rose-600 text-rose-700' : 'bg-white border-zinc-200 text-zinc-500 hover:border-rose-200 hover:bg-rose-50/50'}`}
              >
                Não 😔
              </button>
            </div>
          </div>

          {achieved === false && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">O que aconteceu?</label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Tive um gasto imprevisto com o carro..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none min-h-[100px] resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={achieved === null}
            className="w-full py-4 rounded-xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar Avaliação
          </button>
        </form>
      </div>
    </div>
  );
}
