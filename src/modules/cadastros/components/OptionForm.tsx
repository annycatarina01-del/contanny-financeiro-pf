import React, { useState, useEffect } from "react";
import { AppOption, OptionType } from "../cadastros.types";
import { X } from "lucide-react";

interface OptionFormProps {
  type: OptionType;
  option?: AppOption;
  onSave: (data: { type: OptionType; label: string; value: string }) => void;
  onClose: () => void;
}

export function OptionForm({ type, option, onSave, onClose }: OptionFormProps) {
  const [label, setLabel] = useState(option?.label || "");
  const [value, setValue] = useState(option?.value || "");

  // Auto-generate value from label if creating new
  useEffect(() => {
    if (!option && label) {
      const generatedValue = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
      setValue(generatedValue);
    }
  }, [label, option]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ type, label, value });
  };

  const getTitle = () => {
    const action = option ? "Editar" : "Nova";
    switch (type) {
      case 'expense_category': return `${action} Categoria de Despesa`;
      case 'income_category': return `${action} Categoria de Receita`;
      case 'payment_method': return `${action} Forma de Pagamento`;
      case 'credit_card': return `${action} Cartão de Crédito`;
      case 'funding_source': return `${action} Fonte de Pagamento`;
      default: return `${action} Opção`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Nome (Label)</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Alimentação"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Valor Interno (Value)</label>
            <input
              type="text"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ex: alimentacao"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
            />
            <p className="text-xs text-zinc-400 ml-1 mt-1">
              Identificador único usado pelo sistema. Evite espaços e caracteres especiais.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-lg mt-4"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
