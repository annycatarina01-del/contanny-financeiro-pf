import { TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { BillPayable } from "../contas-pagar.types";
import { isPast, isToday } from "date-fns";

interface KpisProps {
  bills: BillPayable[];
}

export function Kpis({ bills }: KpisProps) {
  const totalPending = bills
    .filter(b => b.status === 'pending')
    .reduce((acc, b) => acc + b.amount, 0);

  const totalOverdue = bills
    .filter(b => b.status === 'pending' && isPast(new Date(b.due_date + 'T12:00:00')) && !isToday(new Date(b.due_date + 'T12:00:00')))
    .reduce((acc, b) => acc + b.amount, 0);

  const totalPaid = bills
    .filter(b => b.status === 'paid')
    .reduce((acc, b) => acc + b.amount, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-zinc-100 text-zinc-600 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Total Pendente</span>
        </div>
        <p className="text-3xl font-bold text-zinc-900">{formatCurrency(totalPending)}</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Total Atrasado</span>
        </div>
        <p className="text-3xl font-bold text-rose-600">{formatCurrency(totalOverdue)}</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Total Pago</span>
        </div>
        <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
      </div>
    </div>
  );
}
