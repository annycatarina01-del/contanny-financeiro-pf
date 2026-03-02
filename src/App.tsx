import { useEffect, useState, useMemo } from "react";
import { Transaction, Summary } from "./types";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { TransactionList } from "./components/TransactionList";
import { TransactionForm } from "./components/TransactionForm";
import { getFinancialInsights } from "./services/geminiService";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Sparkles, PieChart as PieChartIcon, LayoutDashboard, CreditCard, X, Banknote, TrendingUp, Target, Settings, LogOut } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import ContasPagarPage from "./modules/contas-pagar/contas-pagar.page";
import { ContasPagarService } from "./modules/contas-pagar/contas-pagar.service";
import { BillPayable } from "./modules/contas-pagar/contas-pagar.types";
import InvestimentosPage from "./modules/investimentos/investimentos.page";
import ContasReceberPage from "./modules/contas-receber/contas-receber.page";
import { ContasReceberService } from "./modules/contas-receber/contas-receber.service";
import { BillReceivable } from "./modules/contas-receber/contas-receber.types";
import MetasPage from "./modules/metas/metas.page";
import CadastrosPage from "./modules/cadastros/cadastros.page";
import { useOptions } from "./contexts/OptionsContext";
import AuthPage from "./modules/auth/auth.page";
import { useAuth } from "./contexts/AuthContext";
import { TransactionService } from "./services/transactionService";
import { AccountService, Account } from "./services/accountService";

const COLORS = ['#002d4b', '#c5a059', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function App() {
  const { user, organization, signOut, loading: authLoading, refreshSession } = useAuth();
  const { getOptionsByType } = useOptions();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bills, setBills] = useState<BillPayable[]>([]);
  const [receivables, setReceivables] = useState<BillReceivable[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [insights, setInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contas-pagar' | 'contas-receber' | 'investimentos' | 'metas' | 'cadastros'>('dashboard');
  const [detailsModal, setDetailsModal] = useState<'income' | 'expense' | null>(null);
  const [groupBy, setGroupBy] = useState<'category' | 'paymentMethod' | 'cardProvider' | 'none'>('none');
  const [logoError, setLogoError] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<string>("");
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchData = async () => {
    if (!organization) return;

    try {
      const [transactionsData, billsData, receivablesData, accountsData] = await Promise.all([
        TransactionService.getAll(organization.id),
        ContasPagarService.getAll(organization.id),
        ContasReceberService.getAll(organization.id),
        AccountService.getAll(organization.id)
      ]);

      setTransactions(transactionsData);
      setBills(billsData);
      setReceivables(receivablesData);
      setAccounts(accountsData);

      // Create a default account if none exists
      if (accountsData.length === 0) {
        const newAcc = await AccountService.create(organization.id, "Conta Principal", 0);
        setAccounts([newAcc]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchData();
    }
  }, [organization]);

  const handleAddTransaction = async (data: any) => {
    if (!organization || accounts.length === 0) return;

    try {
      await TransactionService.create(organization.id, {
        accountId: accounts[0].id, // Default to first account for now
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date
      });
      fetchData();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: number | string) => {
    if (!organization) return;

    if (typeof id === 'number') {
      // Old ID type, shouldn't happen with Supabase UUIDs
      return;
    }

    try {
      await TransactionService.delete(organization.id, id);
      fetchData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    const text = await getFinancialInsights(transactions);
    setInsights(text);
    setLoadingInsights(false);
  };

  // Combine transactions with bills and receivables
  // We MUST AVOID double-counting: 
  // - Transaction table contains the ACTUAL money movement (Reality).
  // - Entries (Bills/Receivables) contain the PROMISE (Pending or Paid).

  const combinedTransactions: Transaction[] = [
    // 1. All actual transactions from the DB (Realized)
    ...transactions.map(t => ({
      ...t,
      status: t.type === 'income' ? 'received' : 'paid'
    })),
    // 2. Only PENDING bills (Projected Expense)
    ...bills
      .filter(bill => bill.status === 'pending')
      .map(bill => ({
        id: bill.id,
        description: bill.description,
        amount: bill.amount,
        type: 'expense' as const,
        category: bill.category,
        date: bill.due_date,
        isFixed: false,
        paymentMethod: bill.payment_method,
        cardProvider: bill.card_provider,
        investmentId: bill.investment_id,
        status: 'pending' as const
      })),
    // 3. Only PENDING receivables (Projected Income)
    ...receivables
      .filter(rec => rec.status === 'pending')
      .map(rec => ({
        id: rec.id,
        description: rec.description,
        amount: rec.amount,
        type: 'income' as const,
        category: rec.category,
        date: rec.due_date,
        isFixed: false,
        status: 'pending' as const
      }))
  ];

  const filteredTransactions = combinedTransactions.filter(t => {
    const matchesDate = t.date >= startDate && t.date <= endDate;

    let matchesCategory = true;
    if (t.type === 'income') {
      matchesCategory = selectedIncomeCategory ? t.category === selectedIncomeCategory : true;
    } else if (t.type === 'expense') {
      matchesCategory = selectedExpenseCategory ? t.category === selectedExpenseCategory : true;
    }

    let matchesPaymentMethod = true;
    if (selectedPaymentMethod !== 'all') {
      // For transactions that don't have paymentMethod, we might consider them 'other' or skip.
      // Assuming we only filter if paymentMethod matches.
      matchesPaymentMethod = t.paymentMethod === selectedPaymentMethod;
    }

    let matchesFundingSource = true;
    if (selectedFundingSource !== 'all') {
      if (selectedFundingSource === 'investment') {
        matchesFundingSource = !!t.investmentId;
      } else if (selectedFundingSource === 'balance') {
        matchesFundingSource = !t.investmentId;
      }
    }

    return matchesDate && matchesCategory && matchesPaymentMethod && matchesFundingSource;
  });

  const summary: Summary = filteredTransactions.reduce((acc, t) => {
    const isPending = t.status === 'pending';

    if (t.type === 'income') {
      acc.projectedIncome += t.amount;
      if (!isPending) acc.realizedIncome += t.amount;
    } else {
      acc.projectedExpenses += t.amount;
      if (!isPending) acc.realizedExpenses += t.amount;
    }

    acc.realizedBalance = acc.realizedIncome - acc.realizedExpenses;
    acc.projectedBalance = acc.projectedIncome - acc.projectedExpenses;

    return acc;
  }, {
    realizedBalance: 0,
    realizedIncome: 0,
    realizedExpenses: 0,
    projectedBalance: 0,
    projectedIncome: 0,
    projectedExpenses: 0
  });

  const chartData = Object.entries(
    filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {})
  ).map(([name, value]) => ({ name, value }));

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
  }, [accounts]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-12 h-12 border-4 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={refreshSession} />;
  }

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col hidden md:flex">
        <div className="p-8">
          <div className="flex flex-col items-center gap-4 text-zinc-900">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Cont. Anny Logo"
                className="w-24 h-24 rounded-2xl shadow-md object-cover border-2 border-white"
                onError={(e) => {
                  console.error("Logo failed to load, using icon fallback.");
                  setLogoError(true);
                }}
              />
            ) : (
              <div className="w-24 h-24 bg-brand-navy rounded-2xl flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                <Banknote size={48} />
              </div>
            )}
            <span className="text-xl font-bold tracking-tight text-center text-brand-navy">Cont. Anny</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-brand-navy text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('contas-pagar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'contas-pagar' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <CreditCard size={18} />
            Contas a Pagar
          </button>
          <button
            onClick={() => setActiveTab('contas-receber')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'contas-receber' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <Banknote size={18} />
            Contas a Receber
          </button>
          <button
            onClick={() => setActiveTab('investimentos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'investimentos' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <TrendingUp size={18} />
            Investimentos
          </button>
          <button
            onClick={() => setActiveTab('metas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'metas' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <Target size={18} />
            Metas
          </button>
          <button
            onClick={() => setActiveTab('cadastros')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'cadastros' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <Settings size={18} />
            Cadastros
          </button>

          <div className="pt-4 mt-4 border-t border-zinc-100">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Saldo Realizado</p>
            <p className={`text-2xl font-bold ${summary.realizedBalance >= 0 ? 'text-zinc-900' : 'text-rose-600'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.realizedBalance)}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">Olá, Bem-vindo!</h1>
                <p className="text-zinc-500">Acompanhe suas finanças e tome melhores decisões.</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-navy/90 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <Plus size={20} />
                Nova Transação
              </button>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm mb-8">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">De</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Até</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50"
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[180px]">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Cat. Receitas</label>
                <select
                  value={selectedIncomeCategory}
                  onChange={(e) => setSelectedIncomeCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50"
                >
                  <option value="">Todas</option>
                  {getOptionsByType('income_category').map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-[180px]">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Cat. Despesas</label>
                <select
                  value={selectedExpenseCategory}
                  onChange={(e) => setSelectedExpenseCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50"
                >
                  <option value="">Todas</option>
                  {getOptionsByType('expense_category').map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-[180px]">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Forma de Pagamento</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50"
                >
                  <option value="all">Todas</option>
                  {getOptionsByType('payment_method').map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-[180px]">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Fonte de Pagamento</label>
                <select
                  value={selectedFundingSource}
                  onChange={(e) => setSelectedFundingSource(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-zinc-50"
                >
                  <option value="all">Todas</option>
                  {getOptionsByType('funding_source').map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setDetailsModal('income')}
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ArrowUpCircle size={24} />
                  </div>
                  <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Receitas</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.realizedIncome)}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Previsto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.projectedIncome)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => setDetailsModal('expense')}
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <ArrowDownCircle size={24} />
                  </div>
                  <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Despesas</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-rose-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.realizedExpenses)}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Previsto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.projectedExpenses)}
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900 p-6 rounded-3xl shadow-xl text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 text-white rounded-xl">
                    <Wallet size={24} />
                  </div>
                  <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">Saldo Realizado</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.realizedBalance)}
                  </p>
                  <p className="text-xs text-white/40">
                    Projeção: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.projectedBalance)}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart */}
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-2 mb-8">
                  <PieChartIcon size={20} className="text-zinc-400" />
                  <h3 className="text-lg font-bold text-zinc-900">Gastos por Categoria</h3>
                </div>
                <div className="h-[300px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-400 italic">
                      Adicione despesas para ver o gráfico
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-emerald-700">
                    <Sparkles size={20} />
                    <h3 className="text-lg font-bold">Insights da IA</h3>
                  </div>

                  {insights ? (
                    <div className="prose prose-emerald max-w-none">
                      <div className="text-emerald-900/80 leading-relaxed">
                        <Markdown>{insights}</Markdown>
                      </div>
                      <button
                        onClick={generateInsights}
                        disabled={loadingInsights}
                        className="mt-6 text-sm font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
                      >
                        {loadingInsights ? "Analisando..." : "Atualizar Insights"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-emerald-900/60">
                        Nossa IA pode analisar seus gastos e dar dicas personalizadas para você economizar mais.
                      </p>
                      <button
                        onClick={generateInsights}
                        disabled={loadingInsights}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                      >
                        {loadingInsights ? "Analisando..." : "Gerar Insights Agora"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'contas-pagar' ? (
          <ContasPagarPage />
        ) : activeTab === 'contas-receber' ? (
          <ContasReceberPage />
        ) : activeTab === 'investimentos' ? (
          <InvestimentosPage />
        ) : activeTab === 'metas' ? (
          <MetasPage
            transactions={transactions}
            bills={bills}
            receivables={receivables}
          />
        ) : (
          <CadastrosPage />
        )}
      </main>

      <AnimatePresence>
        {showForm && (
          <TransactionForm
            onAdd={handleAddTransaction}
            onClose={() => setShowForm(false)}
          />
        )}
        {detailsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <h2 className="text-lg font-bold text-zinc-900">
                    Detalhes de {detailsModal === 'income' ? 'Receitas' : 'Despesas'}
                  </h2>
                  <button onClick={() => setDetailsModal(null)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors md:hidden">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  <span className="text-xs font-bold text-zinc-500 uppercase whitespace-nowrap">Agrupar por:</span>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                  >
                    <option value="none">Sem agrupamento</option>
                    <option value="category">Categoria</option>
                    {detailsModal === 'expense' && (
                      <>
                        <option value="paymentMethod">Forma de Pagamento</option>
                        <option value="cardProvider">Cartão de Crédito</option>
                      </>
                    )}
                  </select>
                </div>

                <button onClick={() => setDetailsModal(null)} className="hidden md:block p-2 hover:bg-zinc-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
                <TransactionList
                  transactions={filteredTransactions.filter(t => t.type === detailsModal)}
                  onDelete={handleDeleteTransaction}
                  groupBy={groupBy}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
