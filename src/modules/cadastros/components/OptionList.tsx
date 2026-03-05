import { AppOption, OptionType } from "../cadastros.types";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface OptionListProps {
  title: string;
  type: OptionType;
  options: AppOption[];
  onAdd: (type: OptionType) => void;
  onEdit: (option: AppOption) => void;
  onDelete: (id: string) => void;
}

export function OptionList({ title, type, options, onAdd, onEdit, onDelete }: OptionListProps) {
  const filteredOptions = options.filter(o => o.type === type);

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
        <h3 className="font-bold text-zinc-900">{title}</h3>
        <button
          onClick={() => onAdd(type)}
          className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
          title="Adicionar Novo"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
        {filteredOptions.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 italic">
            Nenhuma opção cadastrada.
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredOptions.map(option => {
              const expenseType = type === 'expense_category' ? (option.metadata as any)?.expense_type : undefined;
              const expenseTypeBadge = expenseType === 'essencial'
                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Essencial</span>
                : expenseType === 'lazer'
                  ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Lazer</span>
                  : expenseType === 'investimento'
                    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Investimento</span>
                    : type === 'expense_category'
                      ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">Sem tipo</span>
                      : null;
              return (
                <li key={option.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-colors group">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-900">{option.label}</p>
                      {expenseTypeBadge}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">{option.value}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(option)}
                      className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir '${option.label}'?`)) {
                          onDelete(option.id);
                        }
                      }}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}

          </ul>
        )}
      </div>
    </div>
  );
}
