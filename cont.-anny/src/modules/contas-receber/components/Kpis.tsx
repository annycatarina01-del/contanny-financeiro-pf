import { BillReceivable } from "../contas-receber.types";
import { DollarSign, Clock, CheckCircle } from "lucide-react";

interface KpisProps {
  bills: BillReceivable[];
}

export function Kpis({ bills }: KpisProps) {
  const total = bills.reduce((acc, bill) => acc + bill.amount, 0);
  const received = bills.filter(b => b.status === 'received').reduce((acc, bill) => acc + bill.amount, 0);
  const pending = bills.filter(b => b.status === 'pending').reduce((acc, bill) => acc + bill.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-zinc-100 text-zinc-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Total a Receber</span>
        </div>
        <p className="text-3xl font-bold text-zinc-900">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Recebido</span>
        </div>
        <p className="text-3xl font-bold text-emerald-600">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(received)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Pendente</span>
        </div>
        <p className="text-3xl font-bold text-amber-600">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pending)}
        </p>
      </div>
    </div>
  );
}
