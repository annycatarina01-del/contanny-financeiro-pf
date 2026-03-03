import { useState, useEffect } from "react";
import { CreateReceivableDTO, PaymentMethod } from "../contas-receber.types";
import { X, Calendar, DollarSign, Tag, Repeat, CreditCard } from "lucide-react";
import { motion } from "motion/react";
import { useOptions } from "../../../contexts/OptionsContext";

interface FormAddProps {
  onAdd: (data: CreateReceivableDTO) => void;
  onClose: () => void;
}

export function FormAdd({ onAdd, onClose }: FormAddProps) {
  const { getOptionsByType } = useOptions();
  const incomeCategories = getOptionsByType('income_category');
  const paymentMethods = getOptionsByType('payment_method');

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>('boleto');
  const [isRepeated, setIsRepeated] = useState(false);
  const [months, setMonths] = useState("1");
  const [installments, setInstallments] = useState("1");
  const [paidInstallments, setPaidInstallments] = useState("0");

  useEffect(() => {
    if (incomeCategories.length > 0 && !category) setCategory(incomeCategories[0].value);
    if (paymentMethods.length > 0 && paymentMethod === 'boleto') setPaymentMethod((paymentMethods.find(p => p.value === 'boleto')?.value || paymentMethods[0].value));
  }, [incomeCategories, paymentMethods]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !dueDate) return;

    onAdd({
      description,
      amount: Number(amount),
      dueDate,
      category,
      paymentMethod: paymentMethod as PaymentMethod,
      isRepeated,
      months: isRepeated ? Number(months) : 1,
      installments: Number(installments),
      paidInstallments: Number(paidInstallments),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-xl font-bold text-zinc-900">Nova Conta a Receber</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Venda de Produto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Valor</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Vencimento</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Categoria</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all appearance-none bg-white"
                  >
                    {incomeCategories.map((cat) => (
                      <option key={cat.id} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Pagamento</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all appearance-none bg-white"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">Parcelamento & Repetição</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Já Recebidas</label>
                  <input
                    type="number"
                    min="0"
                    max={Math.max(0, Number(installments) - 1)}
                    value={paidInstallments}
                    onChange={(e) => setPaidInstallments(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isRepeated ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-200 text-zinc-500'}`}>
                  <Repeat size={18} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRepeated}
                      onChange={(e) => setIsRepeated(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <span className="text-sm font-medium text-zinc-900">Repetir mensalmente</span>
                  </label>
                  {isRepeated && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">por</span>
                      <input
                        type="number"
                        min="2"
                        max="60"
                        value={months}
                        onChange={(e) => setMonths(e.target.value)}
                        className="w-16 px-2 py-1 rounded-md border border-zinc-200 focus:ring-1 focus:ring-zinc-900 outline-none text-sm"
                      />
                      <span className="text-xs text-zinc-400">meses</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <DollarSign size={20} />
              Adicionar Recebimento
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
