import { useState, useEffect, useRef } from 'react';
import { Wallet, X, PiggyBank, Landmark, Download, Upload, ShieldCheck, Settings, CreditCard, CalendarCog } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import CurrencyInput from './CurrencyInput';

// Componente auxiliar para seções visuais
function Section({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${iconColor}`}>
          <Icon size={14} className="text-white" />
        </div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide">{title}</h4>
      </div>
      <div className="space-y-3 pl-1">
        {children}
      </div>
    </div>
  );
}

export default function InitialSetupModal({ isOpen, onClose }) {
  const { monthlyIncome, initialBill, closingDay, savingsGoal, initialBankBalance, budgetMode, updateMonthlyIncome } = useFinance();

  const [incomeInput, setIncomeInput] = useState('');
  const [billInput, setBillInput] = useState('');
  const [closingDayInput, setClosingDayInput] = useState('');
  const [savingsInput, setSavingsInput] = useState('');
  const [bankBalanceInput, setBankBalanceInput] = useState('');
  const [budgetModeInput, setBudgetModeInput] = useState('equal');
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBudgetModeInput(budgetMode || 'equal');
    }
  }, [isOpen, monthlyIncome, initialBill, closingDay, savingsGoal, initialBankBalance, budgetMode]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (Number(incomeInput) > 0) {
      updateMonthlyIncome(
        Number(incomeInput), 
        Number(billInput), 
        closingDayInput ? Number(closingDayInput) : null,
        Number(savingsInput),
        Number(bankBalanceInput),
        budgetModeInput
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
    e.target.value = null;
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
        <div className="overflow-y-auto p-6 sm:p-8 pt-6 flex-1">
          <form onSubmit={handleSave} className="space-y-8">

            {/* ═══════════════ SEÇÃO 1: FINANÇAS DO CICLO ═══════════════ */}
            <Section icon={CreditCard} iconColor="bg-gray-700 dark:bg-gray-600" title="Finanças do Ciclo">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Renda Mensal (Teto)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500 font-semibold text-sm">R$</span>
                  <CurrencyInput
                    value={incomeInput}
                    onChange={setIncomeInput}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 pl-11 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base font-semibold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Fatura Atual (Gasto Passado)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-red-400 dark:text-red-500 font-semibold text-sm">R$</span>
                  <CurrencyInput
                    value={billInput}
                    onChange={setBillInput}
                    className="w-full bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-3.5 pl-11 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none text-base font-semibold text-red-600 dark:text-red-400 placeholder-gray-300 dark:placeholder-gray-600"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <PiggyBank size={12} /> Meta de Economia
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-emerald-400 dark:text-emerald-500 font-semibold text-sm">R$</span>
                  <CurrencyInput
                    value={savingsInput}
                    onChange={setSavingsInput}
                    className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3.5 pl-11 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-base font-semibold text-emerald-700 dark:text-emerald-400 placeholder-gray-300 dark:placeholder-gray-600"
                    placeholder="0,00"
                  />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">Opcional. Quanto quer "blindar" do limite?</p>
              </div>
            </Section>

            {/* Separador */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* ═══════════════ SEÇÃO 2: CONTA BANCÁRIA ═══════════════ */}
            <Section icon={Landmark} iconColor="bg-blue-600 dark:bg-blue-500" title="Conta Bancária">
              <div>
                <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5 uppercase tracking-wider">Saldo Guardado</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-blue-400 dark:text-blue-500 font-semibold text-sm">R$</span>
                  <CurrencyInput
                    value={bankBalanceInput}
                    onChange={setBankBalanceInput}
                    className="w-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3.5 pl-11 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base font-semibold text-blue-700 dark:text-blue-300 placeholder-gray-300 dark:placeholder-gray-600"
                    placeholder="0,00"
                  />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">Opcional. Dinheiro no banco, independente do cartão.</p>
              </div>
            </Section>

            {/* Separador */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* ═══════════════ SEÇÃO 3: PREFERÊNCIAS ═══════════════ */}
            <Section icon={CalendarCog} iconColor="bg-violet-600 dark:bg-violet-500" title="Preferências">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Dia de Fechamento da Fatura</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={closingDayInput}
                  onChange={(e) => setClosingDayInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-base font-semibold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="Ex: 28"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">Vazio = Mês civil (1 a 31).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Distribuição do Orçamento</label>
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBudgetModeInput('equal')}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      budgetModeInput === 'equal'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm dark:shadow-none'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    Otimizado (Igual)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetModeInput('daily')}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      budgetModeInput === 'daily'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm dark:shadow-none'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    Padrão (Proporcional)
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">Como dividir o dinheiro entre as semanas.</p>
              </div>
            </Section>

            {/* ═══════════════ BOTÃO SALVAR ═══════════════ */}
            <button
              type="submit"
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-base py-4 rounded-2xl hover:bg-black dark:hover:bg-gray-200 active:scale-[0.98] transition-all shadow-md"
            >
              Salvar Configurações
            </button>
          </form>

          {/* Separador final */}
          <div className="border-t border-gray-100 dark:border-gray-800 mt-8" />

          {/* ═══════════════ SEÇÃO 4: SEGURANÇA ═══════════════ */}
          <div className="pt-6 pb-2">
            <Section icon={ShieldCheck} iconColor="bg-amber-500 dark:bg-amber-600" title="Segurança de Dados">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                Seus dados ficam salvos apenas neste navegador. Exporte regularmente para não perder seu histórico.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <Download size={15} />
                  Exportar
                </button>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <Upload size={15} />
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
            </Section>
          </div>
        </div>

      </div>
    </div>
  );
}
