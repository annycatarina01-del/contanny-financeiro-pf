import { useState, useEffect } from "react";
import { AppOption, OptionType, CreateOptionDTO, UpdateOptionDTO } from "./cadastros.types";
import { CadastrosService } from "./cadastros.service";
import { OptionList } from "./components/OptionList";
import { OptionForm } from "./components/OptionForm";
import { Settings } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

export default function CadastrosPage() {
  const { organization } = useAuth();
  const [options, setOptions] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentType, setCurrentType] = useState<OptionType | null>(null);
  const [editingOption, setEditingOption] = useState<AppOption | undefined>(undefined);

  const fetchData = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const data = await CadastrosService.getAll(organization.id);
      setOptions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchData();
    }
  }, [organization]);

  const handleAdd = (type: OptionType) => {
    setCurrentType(type);
    setEditingOption(undefined);
    setShowForm(true);
  };

  const handleEdit = (option: AppOption) => {
    setCurrentType(option.type);
    setEditingOption(option);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!organization) return;
    try {
      await CadastrosService.delete(organization.id, id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir opção.");
    }
  };

  const handleSave = async (data: { type: OptionType; label: string; value: string }) => {
    if (!organization) return;
    try {
      if (editingOption) {
        await CadastrosService.update(organization.id, editingOption.id, { label: data.label, value: data.value });
      } else {
        await CadastrosService.create(organization.id, { type: data.type, label: data.label, value: data.value });
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar opção.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
            <Settings size={32} className="text-zinc-400" />
            Cadastros
          </h1>
          <p className="text-zinc-500">Gerencie as opções utilizadas em todo o aplicativo.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <OptionList
            title="Categorias de Despesa"
            type="expense_category"
            options={options}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <OptionList
            title="Categorias de Receita"
            type="income_category"
            options={options}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <OptionList
            title="Formas de Pagamento"
            type="payment_method"
            options={options}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <OptionList
            title="Tipos de Cartões de Crédito"
            type="credit_card"
            options={options}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <OptionList
            title="Fontes de Pagamento"
            type="funding_source"
            options={options}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {showForm && currentType && (
        <OptionForm
          type={currentType}
          option={editingOption}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
