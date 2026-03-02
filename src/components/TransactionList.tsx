import { Transaction } from "../types";
import { Trash2, TrendingDown, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number | string) => void;
  groupBy?: 'category' | 'paymentMethod' | 'cardProvider' | 'none';
}

export function TransactionList({ transactions, onDelete, groupBy = 'none' }: TransactionListProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
        <p className="text-zinc-500">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  const toggleGroup = (groupKey: string) => {
    if (expandedGroups.includes(groupKey)) {
      setExpandedGroups(expandedGroups.filter(g => g !== groupKey));
    } else {
      setExpandedGroups([...expandedGroups, groupKey]);
    }
  };

  const renderTable = (items: Transaction[]) => (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-bottom border-zinc-100 bg-zinc-50/50">
          <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
          <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</th>
          <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categoria / Tipo</th>
          <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Valor</th>
          <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {items.map((t) => (
          <tr key={t.id} className="hover:bg-zinc-50 transition-colors group">
            <td className="px-6 py-4 text-sm text-zinc-600">
              {format(new Date(t.date), "dd MMM, yyyy", { locale: ptBR })}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900">{t.description}</span>
                    {t.installment_number && t.total_installments && t.total_installments > 1 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        {t.installment_number}/{t.total_installments}
                      </span>
                    )}
                    {t.status === 'pending' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold uppercase border border-amber-100">
                        Pendente
                      </span>
                    )}
                  </div>
                  {t.paymentMethod && (
                    <span className="text-xs text-zinc-400">
                      {t.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                        t.paymentMethod === 'boleto' ? 'Boleto' :
                          t.paymentMethod === 'installments' ? 'A Prazo' : t.paymentMethod}
                      {t.cardProvider && ` - ${t.cardProvider}`}
                    </span>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                  {t.category}
                </span>
                {t.isFixed && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-tighter border border-indigo-100">
                    Fixa
                  </span>
                )}
              </div>
            </td>
            <td className={`px-6 py-4 text-sm font-semibold text-right ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
            </td>
            <td className="px-6 py-4 text-right">
              <button
                onClick={() => onDelete(t.id)}
                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (groupBy === 'none') {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          {renderTable(transactions)}
        </div>
      </div>
    );
  }

  // Grouping Logic
  const groupedData = transactions.reduce((acc, t) => {
    let key = '';
    if (groupBy === 'category') key = t.category;
    else if (groupBy === 'paymentMethod') key = t.paymentMethod || 'Outros';
    else if (groupBy === 'cardProvider') key = t.cardProvider || (t.paymentMethod === 'credit_card' ? 'Não informado' : 'N/A');

    // Translate payment methods for display
    if (groupBy === 'paymentMethod') {
      if (key === 'credit_card') key = 'Cartão de Crédito';
      else if (key === 'boleto') key = 'Boleto';
      else if (key === 'installments') key = 'A Prazo';
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Initialize expanded groups on first render if empty (optional, maybe expand all by default)
  // For now, let's default to expanded or handle it in the render

  return (
    <div className="space-y-4">
      {Object.entries(groupedData).map(([group, items]) => {
        const total = items.reduce((sum, t) => sum + t.amount, 0);
        const isExpanded = expandedGroups.includes(group);

        return (
          <div key={group} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <button
              onClick={() => toggleGroup(group)}
              className="w-full px-6 py-4 flex items-center justify-between bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDown size={20} className="text-zinc-400" /> : <ChevronRight size={20} className="text-zinc-400" />}
                <span className="font-bold text-zinc-900">{group}</span>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <span className="font-bold text-zinc-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-zinc-100">
                <div className="overflow-x-auto">
                  {renderTable(items)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
