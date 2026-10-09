import { Pencil, Calendar, AlertTriangle, PiggyBank, Landmark, Moon, Sun, ChevronLeft, ChevronRight, HandCoins } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function DashboardHeader({ onOpenSettings, onOpenPending, theme, toggleTheme }) {
  const {
    availableOverall,
    savingsGoal,
    isSavingsCorroded,
    safeSavings,
    cycleInfo,
    totalExtraIncomeSum,
    closingDay,
    currentBankBalance,
    initialBankBalance,
    totalSpent,
    changeCycle,
    pendingIncomes
  } = useFinance();

  const pendingTotal = pendingIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 transition-colors duration-300 pt-14 pb-6 px-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-none sm:rounded-b-3xl dark:border-b dark:border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-1">Livre no Cartão</p>
            <h1 className={`text-4xl font-bold tracking-tight ${availableOverall < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(availableOverall)}
            </h1>
            
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              {(initialBankBalance > 0 || currentBankBalance !== 0) && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-900/30 w-fit px-2.5 py-1 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                  <Landmark size={14} />
                  Conta: {formatCurrency(currentBankBalance)}
                </div>
              )}
              {pendingTotal > 0 && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-900/30 w-fit px-2.5 py-1 rounded-lg border border-amber-100/50 dark:border-amber-800/30">
                  <HandCoins size={14} />
                  Dívidas: {formatCurrency(pendingTotal)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={onOpenPending}
                className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition active:scale-95 shadow-sm dark:shadow-none relative"
                title="Dinheiro a Receber"
              >
                <HandCoins size={20} />
                {pendingTotal > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-gray-900"></span>
                  </span>
                )}
              </button>
              <button 
                onClick={toggleTheme}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95 shadow-sm dark:shadow-none"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={onOpenSettings}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95 shadow-sm dark:shadow-none"
              >
                <Pencil size={20} />
              </button>
            </div>

            {savingsGoal > 0 && (
              <div className={`flex flex-col items-end ${isSavingsCorroded ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {isSavingsCorroded ? <AlertTriangle size={12} /> : <PiggyBank size={12} />}
                  Salvo
                </div>
                <span className="font-bold text-sm bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-700/50">
                  {formatCurrency(safeSavings)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between text-sm gap-y-3">
          <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
            <Calendar size={16} className="text-blue-500 dark:text-blue-400" />
            <div className="flex items-center gap-1 mx-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-1 py-0.5 border border-gray-100 dark:border-gray-700/50">
              <button onClick={() => changeCycle(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500 dark:text-gray-400 active:scale-95">
                <ChevronLeft size={14} />
              </button>
              <span className="min-w-[70px] text-center font-bold text-gray-700 dark:text-gray-200 capitalize">
                {cycleInfo.referenceMonthName.substring(0, 3)}/{cycleInfo.referenceYear.toString().substring(2)}
              </span>
              <button onClick={() => changeCycle(1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500 dark:text-gray-400 active:scale-95">
                <ChevronRight size={14} />
              </button>
            </div>
            <span className="text-gray-300 dark:text-gray-600 mx-0.5">•</span> <strong className="text-gray-800 dark:text-gray-200">{formatCurrency(totalSpent)}</strong>
          </span>
          <div className="flex items-center gap-2">
            {totalExtraIncomeSum > 0 && (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full text-xs border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-1">
                ＋{formatCurrency(totalExtraIncomeSum)}
              </span>
            )}
            <span className="font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
              {closingDay ? `Fecha dia ${closingDay}` : 'Mês Civil'}
            </span>
          </div>
        </div>
      </header>

      {isSavingsCorroded && (
        <div className="mx-5 md:mx-0 md:mt-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex gap-3 items-start shadow-sm dark:shadow-none">
          <AlertTriangle className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Cuidado!</h4>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1 font-medium">Você estourou seu orçamento e está gastando o dinheiro que havia separado para economizar.</p>
          </div>
        </div>
      )}
    </>
  );
}
