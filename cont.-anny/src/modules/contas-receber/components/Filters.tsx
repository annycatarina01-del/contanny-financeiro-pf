import React from "react";
import { Filter } from "lucide-react";
import { PaymentMethod } from "../contas-receber.types";
import { useOptions } from "../../../contexts/OptionsContext";

interface FiltersProps {
  startDate: string;
  endDate: string;
  statusFilter: 'all' | 'received' | 'pending';
  categoryFilter: string;
  paymentMethodFilter: 'all' | PaymentMethod | string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onStatusFilterChange: (status: 'all' | 'received' | 'pending') => void;
  onCategoryFilterChange: (category: string) => void;
  onPaymentMethodFilterChange: (method: 'all' | PaymentMethod | string) => void;
}

export function Filters({
  startDate,
  endDate,
  statusFilter,
  categoryFilter,
  paymentMethodFilter,
  onStartDateChange,
  onEndDateChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onPaymentMethodFilterChange,
}: FiltersProps) {
  const { getOptionsByType } = useOptions();
  const incomeCategories = getOptionsByType('income_category');
  const paymentMethods = getOptionsByType('payment_method');
  return (
    <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-wrap items-end gap-4">
      <div className="flex items-center gap-2 text-zinc-500 mr-2 mb-2">
        <Filter size={18} />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">De</label>
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Até</label>
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1 min-w-[150px]">
        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as any)}
          className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50 text-sm"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="received">Recebidas</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 min-w-[150px]">
        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Categoria</label>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50 text-sm"
        >
          <option value="all">Todas</option>
          {incomeCategories.map(cat => (
            <option key={cat.id} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 min-w-[150px]">
        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Forma de Pagamento</label>
        <select
          value={paymentMethodFilter}
          onChange={(e) => onPaymentMethodFilterChange(e.target.value as any)}
          className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50 text-sm"
        >
          <option value="all">Todas</option>
          {paymentMethods.map(method => (
            <option key={method.id} value={method.value}>{method.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
