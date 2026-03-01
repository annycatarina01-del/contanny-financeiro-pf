import { Investment } from "../investimentos.types";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface KpisProps {
  investments: Investment[];
}

export function Kpis({ investments }: KpisProps) {
  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount_invested, 0);
  const totalCurrent = investments.reduce((acc, inv) => acc + inv.current_value, 0);
  const totalProfit = totalCurrent - totalInvested;
  const profitability = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={20} />
          </div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Investido</span>
        </div>
        <p className="text-2xl font-bold text-zinc-900">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <PieChart size={20} />
          </div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor Atual</span>
        </div>
        <p className="text-2xl font-bold text-zinc-900">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCurrent)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${totalProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {totalProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Rentabilidade</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProfit)}
          </p>
          <span className={`text-sm font-medium ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ({profitability.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
