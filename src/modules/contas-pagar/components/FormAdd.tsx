import React, { useState, useEffect } from "react";
import { PaymentMethod } from "../contas-pagar.types";
import { InvestimentosService } from "../../investimentos/investimentos.service";
import { Investment } from "../../investimentos/investimentos.types";
import { X } from "lucide-react";
import { useOptions } from "../../../contexts/OptionsContext";
import { useAuth } from "../../../contexts/AuthContext";
import { SeedService } from "../../../services/seedService";
import { Sparkles } from "lucide-react";

interface FormAddProps {
  onAdd: (data: any) => void;
  onClose: () => void;
}

export function FormAdd({ onAdd, onClose }: FormAddProps) {
  const { organization } = useAuth();
  const { getOptionsByType, refreshOptions } = useOptions();
  const expenseCategories = getOptionsByType('expense_category');
  const paymentMethods = getOptionsByType('payment_method');
  const creditCards = getOptionsByType('credit_card');
  const fundingSources = getOptionsByType('funding_source');

  const [isSeeding, setIsSeeding] = useState(false);

  const [description, setDescription] = useState("");
  const [secondaryDescription, setSecondaryDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>('boleto');
  const [cardProvider, setCardProvider] = useState("");
  const [investmentId, setInvestmentId] = useState("");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isRepeated, setIsRepeated] = useState(false);
  const [months, setMonths] = useState("1");
  const [installments, setInstallments] = useState("1");
  const [paidInstallments, setPaidInstallments] = useState("0");
  const [sameDayDue, setSameDayDue] = useState(true);

  const [fundingSource, setFundingSource] = useState('balance');

  useEffect(() => {
    if (organization) {
      InvestimentosService.getAll(organization.id).then(setInvestments).catch(console.error);
    }
    if (expenseCategories.length > 0 && !category) setCategory(expenseCategories[0].value);
    if (paymentMethods.length > 0 && paymentMethod === 'boleto') setPaymentMethod(paymentMethods.find(p => p.value === 'boleto')?.value || paymentMethods[0].value);
    if (creditCards.length > 0 && !cardProvider) setCardProvider(creditCards[0].value);
    if (fundingSources.length > 0 && fundingSource === 'balance') setFundingSource(fundingSources.find(f => f.value === 'balance')?.value || fundingSources[0].value);
  }, [organization, expenseCategories, paymentMethods, creditCards, fundingSources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !dueDate || !category || !paymentMethod) return;

    const isCreditCard = paymentMethod === 'credit_card' || paymentMethod === 'cart_o_de_cr_dito';

    const isInvestment = paymentMethod === 'investment' || paymentMethod === 'investimentos';
    const isFundingInvestment = fundingSource === 'investment' || fundingSource === 'investimentos';

    let finalInvestmentId = undefined;
    if (isInvestment) {
      finalInvestmentId = investmentId;
    } else if (isCreditCard && isFundingInvestment) {
      finalInvestmentId = investmentId;
    }

    onAdd({
      description,
      secondaryDescription: secondaryDescription || undefined,
      amount: parseFloat(amount),
      dueDate,
      category,
      paymentMethod: isCreditCard ? 'credit_card' : (paymentMethod as any),
      cardProvider: isCreditCard ? cardProvider : undefined,
      investmentId: finalInvestmentId,
      fundingSource: fundingSource,
      isRepeated,
      months: isRepeated ? parseInt(months) : 1,
      installments: parseInt(installments) > 1 ? parseInt(installments) : 1,
      paidInstallments: parseInt(installments) > 1 ? parseInt(paidInstallments) : 0,
      sameDayDue
    });
  };

  const handleQuickSeed = async () => {
    if (!organization) return;
    try {
      setIsSeeding(true);
      await SeedService.seedDefaultOptions(organization.id);
      await refreshOptions();
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar opções padrão.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-lg font-bold text-zinc-900">Nova Conta a Pagar</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Descrição Primária</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Internet..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Descrição Secundária (Opcional)</label>
              <input
                type="text"
                value={secondaryDescription}
                onChange={(e) => setSecondaryDescription(e.target.value)}
                placeholder="Ex: Detalhes adicionais..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Valor Total</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
              <p className="text-[10px] text-zinc-400 ml-1">Para contas parceladas, este valor será dividido.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Vencimento (1ª Parcela)</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Categoria</label>
              {expenseCategories.length > 0 ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white font-medium"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={handleQuickSeed}
                  disabled={isSeeding}
                  className="w-full px-4 py-3 rounded-xl border border-dashed border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-all"
                >
                  {isSeeding ? "Carregando..." : "Configurar Categorias"}
                </button>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Forma de Pagamento</label>
              {paymentMethods.length > 0 ? (
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white font-medium"
                >
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.value}>{method.label}</option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={handleQuickSeed}
                  disabled={isSeeding}
                  className="w-full px-4 py-3 rounded-xl border border-dashed border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-all"
                >
                  {isSeeding ? "Carregando..." : "Configurar Pagamento"}
                </button>
              )}
            </div>
          </div>

          {(paymentMethod === 'credit_card' || paymentMethod === 'cart_o_de_cr_dito') && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Qual Cartão?</label>
                <select
                  value={cardProvider}
                  onChange={(e) => setCardProvider(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                >
                  {creditCards.map(provider => (
                    <option key={provider.id} value={provider.value}>{provider.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Fonte do Pagamento</label>
                {fundingSources.length > 0 ? (
                  <select
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                  >
                    {fundingSources.map(source => (
                      <option key={source.id} value={source.value}>{source.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                      Nenhuma fonte de pagamento encontrada.
                    </p>
                    <button
                      type="button"
                      onClick={handleQuickSeed}
                      disabled={isSeeding}
                      className="text-[10px] flex items-center gap-1.5 text-brand-navy font-bold hover:underline"
                    >
                      <Sparkles size={12} />
                      {isSeeding ? "Carregando..." : "Carregar Opções Padrão"}
                    </button>
                  </div>
                )}
              </div>

              {(fundingSource === 'investment' || fundingSource === 'investimentos') && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Qual Investimento?</label>
                  <select
                    value={investmentId}
                    onChange={(e) => setInvestmentId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
                  >
                    <option value="">Selecione um investimento</option>
                    {investments.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.current_value)})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {(paymentMethod === 'investment' || paymentMethod === 'investimentos') && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Qual Investimento?</label>
              <select
                value={investmentId}
                onChange={(e) => setInvestmentId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none bg-white"
              >
                <option value="">Selecione um investimento</option>
                {investments.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.current_value)})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 px-1">Parcelamento & Repetição</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Quantidade de Parcelas</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={installments}
                  onChange={(e) => {
                    setInstallments(e.target.value);
                    if (parseInt(paidInstallments) >= parseInt(e.target.value)) {
                      setPaidInstallments("0");
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Já pagas</label>
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, parseInt(installments) - 1)}
                  required
                  value={paidInstallments}
                  onChange={(e) => setPaidInstallments(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <input
                type="checkbox"
                id="isRepeated"
                checked={isRepeated}
                onChange={(e) => setIsRepeated(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <label htmlFor="isRepeated" className="text-sm font-medium text-zinc-700 cursor-pointer select-none">
                Repetir mensalmente
              </label>
              {isRepeated && (
                <div className="flex items-center gap-2 flex-1 ml-2">
                  <span className="text-xs text-zinc-400">por</span>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    required
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className="w-16 px-2 py-1 rounded-md border border-zinc-200 focus:ring-1 focus:ring-zinc-900 outline-none transition-all text-sm"
                  />
                  <span className="text-xs text-zinc-400">meses</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-lg mt-4"
          >
            Salvar Conta
          </button>
        </form>
      </div>
    </div>
  );
}
