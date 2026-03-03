import { BillReceivable } from "../contas-receber.types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, CheckCircle, Clock, CreditCard, Banknote, ArrowRightLeft, Pencil } from "lucide-react";
import { useOptions } from "../../../contexts/OptionsContext";

interface ListProps {
  bills: BillReceivable[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (bill: BillReceivable) => void;
}

export function List({ bills, onDelete, onToggleStatus, onEdit }: ListProps) {
  const { getOptionsByType } = useOptions();
  const paymentMethods = getOptionsByType('payment_method');
  const incomeCategories = getOptionsByType('income_category');

  if (bills.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
        <p className="text-zinc-500">Nenhuma conta a receber encontrada.</p>
      </div>
    );
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'boleto': return <Banknote size={14} />;
      case 'pix': return <ArrowRightLeft size={14} />;
      case 'transfer': return <ArrowRightLeft size={14} />;
      case 'cash': return <Banknote size={14} />;
      default: return <CreditCard size={14} />;
    }
  };

  const getPaymentLabel = (method: string) => {
    return paymentMethods.find(m => m.value === method)?.label || method;
  };

  const getCategoryLabel = (category: string) => {
    return incomeCategories.find(c => c.value === category)?.label || category;
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vencimento</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pagamento</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Valor</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="px-6 py-4 text-sm text-zinc-600">
                  {format(new Date(bill.due_date), "dd MMM, yyyy", { locale: ptBR })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900">{bill.description}</span>
                    {bill.installment_number && bill.total_installments && bill.total_installments > 1 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {bill.installment_number}/{bill.total_installments}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                    {getCategoryLabel(bill.category)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-600">
                    {getPaymentIcon(bill.payment_method)}
                    <span className="text-sm">{getPaymentLabel(bill.payment_method)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-right text-zinc-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onToggleStatus(bill.id, bill.status)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${bill.status === 'received'
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                  >
                    {bill.status === 'received' ? (
                      <>
                        <CheckCircle size={12} /> Recebido
                      </>
                    ) : (
                      <>
                        <Clock size={12} /> Pendente
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 transition-opacity">
                    <button
                      onClick={() => onEdit(bill)}
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(bill.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
