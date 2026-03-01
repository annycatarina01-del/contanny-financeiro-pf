import { useEffect, useState } from "react";
import { InvestimentosService } from "./investimentos.service";
import { Investment, CreateInvestmentDTO } from "./investimentos.types";
import { List } from "./components/List";
import { FormAdd } from "./components/FormAdd";
import { FormEdit } from "./components/FormEdit";
import { FormRedeem } from "./components/FormRedeem";
import { Kpis } from "./components/Kpis";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useAuth } from "../../contexts/AuthContext";
import { Account, AccountService } from "../../services/accountService";

export default function InvestimentosPage() {
  const { organization } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [redeemingInvestment, setRedeemingInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const [investmentsData, accountsData] = await Promise.all([
        InvestimentosService.getAll(organization.id),
        AccountService.getAll(organization.id)
      ]);
      setInvestments(investmentsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [organization]);

  const handleAdd = async (data: CreateInvestmentDTO) => {
    if (!organization) return;
    try {
      await InvestimentosService.create(organization.id, data);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    if (!organization) return;
    try {
      await InvestimentosService.update(organization.id, id, data);
      setEditingInvestment(null);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!organization) return;
    try {
      await InvestimentosService.delete(organization.id, id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRedeem = async (id: string, accountId: string, amount: number, date: string) => {
    if (!organization) return;
    try {
      await InvestimentosService.redeem(organization.id, accountId, id, amount, date);
      setRedeemingInvestment(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao resgatar");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Investimentos</h1>
          <p className="text-zinc-500">Acompanhe a evolução do seu patrimônio.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Novo Investimento
        </button>
      </div>

      <Kpis investments={investments} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : (
        <List
          investments={investments}
          onDelete={handleDelete}
          onEdit={setEditingInvestment}
          onRedeem={setRedeemingInvestment}
        />
      )}

      <AnimatePresence>
        {showForm && (
          <FormAdd
            onAdd={handleAdd}
            onClose={() => setShowForm(false)}
          />
        )}

        {editingInvestment && (
          <FormEdit
            investment={editingInvestment}
            onUpdate={handleUpdate}
            onClose={() => setEditingInvestment(null)}
          />
        )}

        {redeemingInvestment && (
          <FormRedeem
            investment={redeemingInvestment}
            accounts={accounts}
            onRedeem={handleRedeem}
            onClose={() => setRedeemingInvestment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
