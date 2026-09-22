import { useState, useEffect, useRef } from 'react';
import { Wallet, X, PiggyBank, Landmark, Download, Upload, ShieldCheck } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

export default function InitialSetupModal({ isOpen, onClose }) {
  const { monthlyIncome, initialBill, closingDay, savingsGoal, initialBankBalance, updateMonthlyIncome } = useFinance();

  const [incomeInput, setIncomeInput] = useState('');
  const [billInput, setBillInput] = useState('');
  const [closingDayInput, setClosingDayInput] = useState('');
  const [savingsInput, setSavingsInput] = useState('');
  const [bankBalanceInput, setBankBalanceInput] = useState('');
  const fileInputRef = useRef(null);

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

  const handleExport = () => {
    const data = localStorage.getItem('@financeApp:state');
    if (!data) return alert('Nenhum dado encontrado para exportar.');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastamenos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json && typeof json === 'object') {
          localStorage.setItem('@financeApp:state', JSON.stringify(json));
          alert('Backup restaurado com sucesso! A página será recarregada.');
          window.location.reload();
        }
      } catch {
        alert('Arquivo de backup inválido ou corrompido.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reseta o input
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity px-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg md:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform animate-slide-up flex flex-col max-h-[90vh] overflow-hidden border border-transparent dark:border-gray-800">
        
        {/* Sticky Header */}
        <div className="flex justify-between items-center p-6 sm:p-8 pb-5 shrink-0 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="text-blue-600 dark:text-blue-400" /> Configuração
          </h3>
          {monthlyIncome > 0 && (
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 active:scale-95 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 pt-5 flex-1">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Renda Mensal (Teto)</label>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">Quanto você ganha ou planeja gastar no ciclo?</p>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 font-semibold">R$</span>
                <input
                  type="number"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                <Landmark size={16} /> Saldo da Conta (Guardado)
              </label>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">Opcional. Dinheiro no banco, livre do cartão.</p>
              <div className="relative">
                <span className="absolute left-4 top-4 text-blue-400 dark:text-blue-500 font-semibold">R$</span>
                <input
                  type="number"
                  value={bankBalanceInput}
                  onChange={(e) => setBankBalanceInput(e.target.value)}
                  className="w-full bg-blue-50 dark:bg-blue-900/20 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold text-blue-700 dark:text-blue-300 placeholder-blue-300 dark:placeholder-blue-800/50"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Fechamento</label>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">Vazio = Mês Civil</p>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={closingDayInput}
                  onChange={(e) => setClosingDayInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="Ex: 10"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Fatura Atual</label>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">Gasto passado</p>
                <input
                  type="number"
                  value={billInput}
                  onChange={(e) => setBillInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-red-400 outline-none text-lg font-semibold text-red-600 dark:text-red-400 placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <PiggyBank size={16} /> Meta de Economia
              </label>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">Opcional. Quanto quer "blindar" do limite?</p>
              <div className="relative">
                <span className="absolute left-4 top-4 text-emerald-400 dark:text-emerald-500 font-semibold">R$</span>
                <input
                  type="number"
                  value={savingsInput}
                  onChange={(e) => setSavingsInput(e.target.value)}
                  className="w-full bg-emerald-50 dark:bg-emerald-900/20 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold text-emerald-700 dark:text-emerald-400 placeholder-emerald-300 dark:placeholder-emerald-800/50"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg py-4 rounded-2xl hover:bg-black dark:hover:bg-gray-200 active:scale-[0.98] transition-all mt-4 shadow-md"
            >
              Salvar Configurações
            </button>
          </form>

          {/* --- Seção de Segurança / Backup --- */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 mb-4">
              <ShieldCheck size={18} className="text-blue-500" />
              Segurança de Dados
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Seus dados ficam salvos apenas no seu navegador. Faça um backup regular para não perder seu histórico financeiro caso limpe o celular.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-3 px-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Download size={16} />
                Exportar
              </button>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Upload size={16} />
                Importar
              </button>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImport}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
