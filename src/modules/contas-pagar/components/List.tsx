import { useState } from "react";
import { BillPayable } from "../contas-pagar.types";
import { Trash2, CheckCircle, Clock, AlertCircle, CreditCard, Banknote, CalendarClock, CheckSquare, Square, Pencil, TrendingUp } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { useOptions } from "../../../contexts/OptionsContext";

interface ListProps {
  bills: BillPayable[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onBulkPay?: (ids: string[]) => void;
  onEdit: (bill: BillPayable) => void;
}

export function List({ bills, onDelete, onToggleStatus, onBulkPay, onEdit }: ListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { getOptionsByType } = useOptions();
  const paymentMethods = getOptionsByType('payment_method');
  const categories = getOptionsByType('expense_category');
  const creditCards = getOptionsByType('credit_card');
  const fundingSources = getOptionsByType('funding_source');

  if (bills.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
        <p className="text-zinc-500">Nenhuma conta a pagar encontrada.</p>
      </div>
    );
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === bills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bills.map(b => b.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkPayClick = () => {
    if (onBulkPay) {
      onBulkPay(selectedIds);
      setSelectedIds([]);
    }
  };

  const getStatusInfo = (bill: BillPayable) => {
    if (bill.status === 'paid') return { label: 'Pago', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle size={14} /> };

    const date = new Date(bill.due_date);
    if (isPast(date) && !isToday(date)) return { label: 'Atrasado', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <AlertCircle size={14} /> };
    if (isToday(date)) return { label: 'Vence Hoje', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={14} /> };

    return { label: 'Pendente', color: 'bg-zinc-100 text-zinc-600 border-zinc-200', icon: <Clock size={14} /> };
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCard size={14} />;
      case 'boleto': return <Banknote size={14} />;
      case 'installments': return <CalendarClock size={14} />;
      case 'investment':
      case 'investimentos': return <TrendingUp size={14} />;
      default: return <Banknote size={14} />;
    }
  };

  const PAYMENT_METHOD_FALLBACK: Record<string, string> = {
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    boleto: 'Boleto',
    pix: 'PIX',
    cash: 'Dinheiro',
    transfer: 'Transferência',
    installments: 'Parcelado',
    investment: 'Investimentos',
    investimentos: 'Investimentos',
  };

  const getPaymentMethodLabel = (method: string) => {
    return paymentMethods.find(m => m.value === method)?.label
      || PAYMENT_METHOD_FALLBACK[method]
      || method;
  };

  const getCardProviderLabel = (provider: string) => {
    return creditCards.find(c => c.value === provider)?.label || provider;
  };

  const getFundingSourceLabel = (bill: BillPayable) => {
    if (bill.investment_id) {
      const investmentSource = fundingSources.find(f => f.value === 'investment' || f.value === 'investimentos');
      return investmentSource?.label || 'Investimento';
    }
    const balanceSource = fundingSources.find(f => f.value === 'balance' || f.value === 'saldo');
    return balanceSource?.label || 'Saldo / Salário';
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 z-50"
          >
            <span className="font-medium">{selectedIds.length} selecionados</span>
            <div className="h-4 w-px bg-zinc-700"></div>
            <button
              onClick={handleBulkPayClick}
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors font-bold"
            >
              <CheckCircle size={18} />
              Confirmar Pagamento
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="ml-2 p-1 hover:bg-zinc-800 rounded-full"
            >
              <span className="sr-only">Cancelar</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-zinc-100 bg-zinc-50/50">
                <th className="px-6 py-4 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {selectedIds.length === bills.length && bills.length > 0 ? (
                      <CheckSquare size={20} className="text-zinc-900" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fonte</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {bills.map((bill) => {
                const status = getStatusInfo(bill);
                const isSelected = selectedIds.includes(bill.id);

                return (
                  <tr key={bill.id} className={`hover:bg-zinc-50 transition-colors group ${isSelected ? 'bg-zinc-50' : ''}`}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleSelect(bill.id)}
                        className="text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare size={20} className="text-zinc-900" />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {format(new Date(bill.due_date), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-900">{bill.description}</span>
                          {bill.total_installments && bill.total_installments > 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                              {bill.installment_number}/{bill.total_installments}
                            </span>
                          )}
                        </div>
                        {bill.secondary_description && (
                          <span className="text-xs text-zinc-500 mt-0.5">{bill.secondary_description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                        {categories.find(c => c.value === bill.category)?.label || bill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                          {getPaymentMethodIcon(bill.payment_method)}
                          <span>{getPaymentMethodLabel(bill.payment_method)}</span>
                        </div>
                        {bill.payment_method === 'credit_card' && bill.card_provider && (
                          <span className="text-xs text-zinc-400 pl-5">{getCardProviderLabel(bill.card_provider)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-600">
                        {getFundingSourceLabel(bill)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-zinc-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => onToggleStatus(bill.id, bill.status)}
                          className={`p-2 rounded-lg transition-colors ${bill.status === 'paid' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={bill.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(bill)}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(bill.id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
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
    </div>
  );
}
