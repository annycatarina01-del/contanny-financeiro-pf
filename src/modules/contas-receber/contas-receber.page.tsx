import { useEffect, useState } from "react";
import { ContasReceberService } from "./contas-receber.service";
import { BillReceivable, CreateReceivableDTO, PaymentMethod } from "./contas-receber.types";
import { List } from "./components/List";
import { FormAdd } from "./components/FormAdd";
import { FormEdit } from "./components/FormEdit";
import { Kpis } from "./components/Kpis";
import { Filters } from "./components/Filters";
import { Plus, X, Calendar, Filter, CalendarSearch } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { startOfMonth, endOfMonth, format, addMonths, isSameMonth, isSameYear } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAuth } from "../../contexts/AuthContext";
import { Account, AccountService } from "../../services/accountService";

export default function ContasReceberPage() {
  const { organization } = useAuth();
  const [bills, setBills] = useState<BillReceivable[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<BillReceivable | null>(null);
  const [loading, setLoading] = useState(true);

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptDate, setReceiptDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [idsToReceive, setIdsToReceive] = useState<string[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(format(startOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | PaymentMethod>('all');

  const fetchBillsAndAccounts = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const [billsData, accountsData] = await Promise.all([
        ContasReceberService.getAll(organization.id),
        AccountService.getAll(organization.id)
      ]);
      setBills(billsData);
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccountId(accountsData[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillsAndAccounts();
  }, [organization]);

  const handleAdd = async (data: CreateReceivableDTO) => {
    if (!organization) return;
    try {
      await ContasReceberService.create(organization.id, data);
      setShowForm(false);
      fetchBillsAndAccounts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    if (!organization) return;
    try {
      await ContasReceberService.update(organization.id, id, data);
      setEditingBill(null);
      fetchBillsAndAccounts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!organization) return;
    try {
      await ContasReceberService.delete(organization.id, id);
      fetchBillsAndAccounts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (!organization) return;
    if (currentStatus === 'received') {
      try {
        await ContasReceberService.updateStatus(organization.id, id, "", 'pending');
        fetchBillsAndAccounts();
      } catch (error) {
        console.error(error);
      }
    } else {
      setIdsToReceive([id]);
      setReceiptDate(format(new Date(), 'yyyy-MM-dd'));
      setShowReceiptModal(true);
    }
  };

  const confirmReceipt = async () => {
    if (!organization || !selectedAccountId) return;
    try {
      if (idsToReceive.length > 0) {
        await ContasReceberService.updateStatus(organization.id, idsToReceive[0], selectedAccountId, 'received', receiptDate);
      }
      setShowReceiptModal(false);
      setIdsToReceive([]);
      fetchBillsAndAccounts();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesDate = bill.due_date >= startDate && bill.due_date <= endDate;
    const matchesStatus = statusFilter === 'all' ? true : bill.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' ? true : bill.category === categoryFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' ? true : bill.payment_method === paymentMethodFilter;

    return matchesDate && matchesStatus && matchesCategory && matchesPaymentMethod;
  });

  const getPeriodLabel = (start: string, end: string) => {
    const startDate = new Date(start + 'T12:00:00');
    const endDate = new Date(end + 'T12:00:00');

    const isFullMonth =
      startDate.getDate() === 1 &&
      endDate.getDate() === endOfMonth(startDate).getDate() &&
      isSameMonth(startDate, endDate) &&
      isSameYear(startDate, endDate);

    if (isFullMonth) {
      return format(startDate, 'MMMM yyyy', { locale: ptBR });
    }

    return `${format(startDate, 'dd/MM')} a ${format(endDate, 'dd/MM/yyyy')}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Contas a Receber</h1>
          <p className="text-zinc-500">Gerencie seus recebimentos futuros e mantenha o caixa saudável.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${showFilters
              ? 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
          >
            <Filter size={20} />
            Filtros
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} />
            Novo Recebimento
          </button>
        </div>
      </div>

      {/* Period Context Card */}
      <div className="bg-white px-6 py-4 rounded-3xl border border-zinc-200 shadow-sm flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Período Visualizado</p>
            <h3 className="text-xl font-bold text-zinc-900 capitalize">
              {getPeriodLabel(startDate, endDate)}
            </h3>
          </div>
        </div>
        {!showFilters && (
          <button
            onClick={() => setShowFilters(true)}
            className="text-xs font-bold text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1.5"
          >
            <CalendarSearch size={14} />
            Alterar Período
          </button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <Filters
              startDate={startDate}
              endDate={endDate}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              paymentMethodFilter={paymentMethodFilter}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onStatusFilterChange={setStatusFilter}
              onCategoryFilterChange={setCategoryFilter}
              onPaymentMethodFilterChange={(method) => setPaymentMethodFilter(method as 'all' | PaymentMethod)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Kpis bills={filteredBills} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : (
        <List
          bills={filteredBills}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onEdit={setEditingBill}
        />
      )}

      <AnimatePresence>
        {showForm && (
          <FormAdd
            onAdd={handleAdd}
            onClose={() => setShowForm(false)}
          />
        )}

        {editingBill && (
          <FormEdit
            bill={editingBill}
            onUpdate={handleUpdate}
            onClose={() => setEditingBill(null)}
          />
        )}

        {showReceiptModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h2 className="text-lg font-bold text-zinc-900">Confirmar Recebimento</h2>
                <button onClick={() => setShowReceiptModal(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-zinc-600">
                  Selecione a data em que o recebimento foi realizado.
                </p>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Conta de Destino</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} (Saldo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Data do Recebimento</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="date"
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={confirmReceipt}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 mt-2"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
