import { Investment, INVESTMENT_TYPES } from "../investimentos.types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Pencil, TrendingUp, TrendingDown, Minus, ArrowDownCircle } from "lucide-react";

interface ListProps {
  investments: Investment[];
  onDelete: (id: string) => void;
  onEdit: (investment: Investment) => void;
  onRedeem: (investment: Investment) => void;
}

export function List({ investments, onDelete, onEdit, onRedeem }: ListProps) {
  if (investments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
        <p className="text-zinc-500">Nenhum investimento encontrado.</p>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    return INVESTMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ativo</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data Compra</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Investido</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Atual</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Comprometido</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Retorno</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {investments.map((inv) => {
              const profit = inv.current_value - inv.amount_invested;
              const profitPercent = inv.amount_invested > 0 ? (profit / inv.amount_invested) * 100 : 0;

              return (
                <tr key={inv.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-zinc-900">{inv.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                      {getTypeLabel(inv.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {format(new Date(inv.purchase_date), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right text-zinc-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.amount_invested)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-zinc-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.current_value)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right text-amber-600">
                    {inv.total_linked_payable && inv.total_linked_payable > 0
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.total_linked_payable)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`flex items-center justify-end gap-1 text-sm font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {profit > 0 ? <TrendingUp size={14} /> : profit < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                      <span>{profitPercent.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button
                        onClick={() => onRedeem(inv)}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Resgatar"
                      >
                        <ArrowDownCircle size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(inv)}
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(inv.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
