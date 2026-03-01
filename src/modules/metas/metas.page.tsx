import { useEffect, useState } from "react";
import { MetasService } from "./metas.service";
import { MonthlyGoal, CreateGoalDTO, UpdateGoalDTO, EvaluateGoalDTO } from "./metas.types";
import { GoalCard } from "./components/GoalCard";
import { FormGoal } from "./components/FormGoal";
import { FormEvaluate } from "./components/FormEvaluate";
import { Target, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence } from "motion/react";

import { useAuth } from "../../contexts/AuthContext";

interface MetasPageProps {
  transactions: any[];
  bills: any[];
  receivables: any[];
}

export default function MetasPage({ transactions, bills, receivables }: MetasPageProps) {
  const { organization } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [goal, setGoal] = useState<MonthlyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEvaluate, setShowEvaluate] = useState(false);

  const monthStr = format(currentDate, "yyyy-MM");

  const fetchGoal = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const data = await MetasService.getByMonth(organization.id, monthStr);
      setGoal(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchGoal();
    }
  }, [monthStr, organization]);

  const handleSaveGoal = async (data: CreateGoalDTO | UpdateGoalDTO) => {
    if (!organization) return;
    try {
      if (goal) {
        await MetasService.update(organization.id, goal.id, data as UpdateGoalDTO);
      } else {
        await MetasService.create(organization.id, data as CreateGoalDTO);
      }
      setShowForm(false);
      fetchGoal();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao salvar meta");
    }
  };

  const handleEvaluate = async (achieved: boolean, reason?: string) => {
    if (!goal || !organization) return;
    try {
      await MetasService.evaluate(organization.id, goal.id, { achieved, reason });
      setShowEvaluate(false);
      fetchGoal();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao avaliar meta");
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calculate totals for the current month
  const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
  const monthBills = bills.filter(b => b.status === 'paid' && (b.payment_date || b.due_date).startsWith(monthStr));

  // All receivables for the month (pending and received)
  const allMonthReceivables = receivables.filter(r => r.due_date.startsWith(monthStr));

  const totalIncome = allMonthReceivables.reduce((acc, r) => acc + r.amount, 0);

  const essentialCategories = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação'];
  const leisureCategories = ['Lazer', 'Outros'];
  const investmentCategories = ['Investimentos'];

  const essentialSpent =
    monthTransactions.filter(t => t.type === 'expense' && essentialCategories.includes(t.category)).reduce((acc, t) => acc + t.amount, 0) +
    monthBills.filter(b => essentialCategories.includes(b.category)).reduce((acc, b) => acc + b.amount, 0);

  const leisureSpent =
    monthTransactions.filter(t => t.type === 'expense' && leisureCategories.includes(t.category)).reduce((acc, t) => acc + t.amount, 0) +
    monthBills.filter(b => leisureCategories.includes(b.category)).reduce((acc, b) => acc + b.amount, 0);

  const investmentSpent =
    monthTransactions.filter(t => t.type === 'expense' && investmentCategories.includes(t.category)).reduce((acc, t) => acc + t.amount, 0) +
    monthBills.filter(b => investmentCategories.includes(b.category)).reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Metas Mensais</h1>
          <p className="text-zinc-500">Defina e acompanhe seus objetivos financeiros.</p>
        </div>

        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-zinc-200 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-zinc-900 min-w-[120px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-500 uppercase">Receita Total do Mês</p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Valor base para cálculo das metas (A Receber + Recebidos)</p>
            </div>
          </div>

          <GoalCard
            goal={goal}
            month={monthStr}
            onEdit={() => setShowForm(true)}
            onEvaluate={() => setShowEvaluate(true)}
            income={totalIncome}
            essentialSpent={essentialSpent}
            leisureSpent={leisureSpent}
            investmentSpent={investmentSpent}
          />
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <FormGoal
            month={monthStr}
            goal={goal}
            onSave={handleSaveGoal}
            onClose={() => setShowForm(false)}
          />
        )}

        {showEvaluate && goal && (
          <FormEvaluate
            goal={goal}
            onEvaluate={handleEvaluate}
            onClose={() => setShowEvaluate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
