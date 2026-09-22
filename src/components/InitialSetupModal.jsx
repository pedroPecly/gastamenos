import { useState, useEffect } from 'react';
import { Wallet, X, PiggyBank, Landmark } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

export default function InitialSetupModal({ isOpen, onClose }) {
  const { monthlyIncome, initialBill, closingDay, savingsGoal, initialBankBalance, updateMonthlyIncome } = useFinance();

  const [incomeInput, setIncomeInput] = useState('');
  const [billInput, setBillInput] = useState('');
  const [closingDayInput, setClosingDayInput] = useState('');
  const [savingsInput, setSavingsInput] = useState('');
  const [bankBalanceInput, setBankBalanceInput] = useState('');

  // Sincroniza inputs quando abre
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIncomeInput(monthlyIncome > 0 ? String(monthlyIncome) : '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBillInput(initialBill > 0 ? String(initialBill) : '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClosingDayInput(closingDay ? String(closingDay) : '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavingsInput(savingsGoal > 0 ? String(savingsGoal) : '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBankBalanceInput(initialBankBalance > 0 ? String(initialBankBalance) : '');
    }
  }, [isOpen, monthlyIncome, initialBill, closingDay, savingsGoal, initialBankBalance]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (Number(incomeInput) > 0) {
      updateMonthlyIncome(
        Number(incomeInput), 
        Number(billInput), 
        closingDayInput ? Number(closingDayInput) : null,
        Number(savingsInput),
        Number(bankBalanceInput)
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:max-w-md mx-auto transition-opacity">
      <div className="bg-white w-full rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-blue-600" /> Configuração Inicial
          </h3>
          {monthlyIncome > 0 && (
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 active:scale-95">
              <X size={20} />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Renda Mensal (Teto)</label>
            <p className="text-[11px] text-gray-400 mb-2">Quanto você ganha ou planeja gastar no ciclo?</p>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-400 font-semibold">R$</span>
              <input
                type="number"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-blue-600 mb-1 flex items-center gap-1">
              <Landmark size={16} /> Saldo da Conta (Dinheiro Guardado)
            </label>
            <p className="text-[11px] text-gray-400 mb-2">Opcional. Dinheiro atual no banco, livre do limite do cartão.</p>
            <div className="relative">
              <span className="absolute left-4 top-4 text-blue-400 font-semibold">R$</span>
              <input
                type="number"
                value={bankBalanceInput}
                onChange={(e) => setBankBalanceInput(e.target.value)}
                className="w-full bg-blue-50 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold text-blue-700 placeholder-blue-300"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Dia de Fechamento da Fatura</label>
            <p className="text-[11px] text-gray-400 mb-2">Opcional. Deixe em branco para mês civil.</p>
            <input
              type="number"
              min="1"
              max="31"
              value={closingDayInput}
              onChange={(e) => setClosingDayInput(e.target.value)}
              className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold"
              placeholder="Ex: 10"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-emerald-600 mb-1 flex items-center gap-1">
              <PiggyBank size={16} /> Meta de Economia
            </label>
            <p className="text-[11px] text-gray-400 mb-2">Opcional. Quanto quer "blindar" para guardar esse mês?</p>
            <div className="relative">
              <span className="absolute left-4 top-4 text-emerald-400 font-semibold">R$</span>
              <input
                type="number"
                value={savingsInput}
                onChange={(e) => setSavingsInput(e.target.value)}
                className="w-full bg-emerald-50 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold text-emerald-700 placeholder-emerald-300"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fatura Atual</label>
            <p className="text-[11px] text-gray-400 mb-2">Opcional. Despesas já lançadas no cartão antes de usar o app.</p>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-400 font-semibold">R$</span>
              <input
                type="number"
                value={billInput}
                onChange={(e) => setBillInput(e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-red-400 outline-none text-lg font-semibold text-red-600 placeholder-red-300"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl hover:bg-black active:scale-[0.98] transition-all mt-4"
          >
            Salvar Configurações
          </button>
        </form>
      </div>
    </div>
  );
}
