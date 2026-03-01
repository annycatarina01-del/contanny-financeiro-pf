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
            {filteredOptions.map(option => (
              <li key={option.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-colors group">
                <div>
                  <p className="font-semibold text-zinc-900">{option.label}</p>
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
