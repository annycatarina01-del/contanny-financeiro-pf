import { MonthlyGoal } from "../metas.types";
import { CheckCircle2, XCircle, Pencil, Target, Trash2 } from "lucide-react";
import { MetasService } from "../metas.service";
import { useAuth } from "../../../contexts/AuthContext";

interface GoalCardProps {
  goal: MonthlyGoal | null;
  month: string;
  onEdit: () => void;
  onEvaluate: () => void;
  income: number;
  essentialSpent: number;
  leisureSpent: number;
  investmentSpent: number;
  essentialCommitted: number;
  leisureCommitted: number;
  investmentCommitted: number;
  onDelete: () => void;
}

export function GoalCard({ goal, month, onEdit, onEvaluate, income, essentialSpent, leisureSpent, investmentSpent, essentialCommitted, leisureCommitted, investmentCommitted, onDelete }: GoalCardProps) {
  const { organization } = useAuth();

  if (!goal) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
          <Target size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Nenhuma meta definida</h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Crie uma meta para o mês de {month} e acompanhe seus gastos de forma inteligente.
          </p>
        </div>
        <button
          onClick={onEdit}
          className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95 mt-4"
        >
          Criar Meta Agora
        </button>
      </div>
    );
  }

  const essentialTarget = (income * goal.essential_percent) / 100;
  const leisureTarget = (income * goal.leisure_percent) / 100;
  const investmentTarget = (income * goal.investment_percent) / 100;

  const totalEssential = essentialSpent + essentialCommitted;
  const totalLeisure = leisureSpent + leisureCommitted;
  const totalInvestment = investmentSpent + investmentCommitted;

  const essentialProgress = essentialTarget > 0 ? Math.min(100, (totalEssential / essentialTarget) * 100) : 0;
  const leisureProgress = leisureTarget > 0 ? Math.min(100, (totalLeisure / leisureTarget) * 100) : 0;
  const investmentProgress = investmentTarget > 0 ? Math.min(100, (totalInvestment / investmentTarget) * 100) : 0;

  const handleDelete = async () => {
    if (!goal || !organization) return;

    if (window.confirm("Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.")) {
      try {
        await MetasService.delete(organization.id, goal.id);
        alert("Meta excluída com sucesso!");
        onDelete();
      } catch (error) {
        console.error("Erro ao excluir meta:", error);
        alert("Erro ao excluir a meta.");
      }
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Target size={24} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">{goal.name}</h2>
          </div>
          <p className="text-zinc-500">Acompanhamento da meta para {month}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
          >
            <Pencil size={16} />
            Editar
          </button>
          <button
            onClick={onEvaluate}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors shadow-md"
          >
            Avaliar Mês
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Excluir Meta"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {goal.achieved !== null && (
        <div className={`mb-8 p-4 rounded-2xl border flex items-start gap-4 ${goal.achieved === 1 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <div className={`mt-1 ${goal.achieved === 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {goal.achieved === 1 ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          </div>
          <div>
            <h4 className={`font-bold ${goal.achieved === 1 ? 'text-emerald-900' : 'text-rose-900'}`}>
              {goal.achieved === 1 ? 'Meta Cumprida! 🎉' : 'Meta Não Cumprida 😔'}
            </h4>
            {goal.reason && (
              <p className={`text-sm mt-1 ${goal.achieved === 1 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Motivo: {goal.reason}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Essencial */}
        <div className="space-y-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-zinc-900">Essencial ({goal.essential_percent}%)</h4>
            <span className="text-sm font-medium text-zinc-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(essentialTarget)}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Gasto Atual</span>
              <span className={`font-bold ${totalEssential > essentialTarget ? 'text-rose-600' : 'text-zinc-900'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(essentialSpent)}
              </span>
            </div>
            <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${totalEssential > essentialTarget ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${essentialProgress}%` }}
              />
            </div>
            <div className="mt-2 space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Comprometido (A Pagar):</span>
                <span className="font-bold text-amber-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(essentialCommitted)}</span>
              </div>
              <div className="flex justify-end">
                <span className="text-zinc-400 font-medium">{essentialProgress.toFixed(0)}% utilizado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lazer */}
        <div className="space-y-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-zinc-900">Lazer ({goal.leisure_percent}%)</h4>
            <span className="text-sm font-medium text-zinc-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(leisureTarget)}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Gasto Atual</span>
              <span className={`font-bold ${totalLeisure > leisureTarget ? 'text-rose-600' : 'text-zinc-900'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(leisureSpent)}
              </span>
            </div>
            <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${totalLeisure > leisureTarget ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${leisureProgress}%` }}
              />
            </div>
            <div className="mt-2 space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Comprometido (A Pagar):</span>
                <span className="font-bold text-amber-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(leisureCommitted)}</span>
              </div>
              <div className="flex justify-end">
                <span className="text-zinc-400 font-medium">{leisureProgress.toFixed(0)}% utilizado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investimentos */}
        <div className="space-y-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-zinc-900">Investimentos ({goal.investment_percent}%)</h4>
            <span className="text-sm font-medium text-zinc-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investmentTarget)}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Investido Atual</span>
              <span className={`font-bold ${totalInvestment < investmentTarget ? 'text-amber-600' : 'text-emerald-600'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investmentSpent)}
              </span>
            </div>
            <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${totalInvestment < investmentTarget ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${investmentProgress}%` }}
              />
            </div>
            <div className="mt-2 space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Comprometido (A Pagar):</span>
                <span className="font-bold text-amber-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investmentCommitted)}</span>
              </div>
              <div className="flex justify-end">
                <span className="text-zinc-400 font-medium">{investmentProgress.toFixed(0)}% alcançado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
