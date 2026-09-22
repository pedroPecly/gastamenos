import { Pencil, Calendar, AlertTriangle, PiggyBank, Landmark } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function DashboardHeader({ onOpenSettings }) {
  const {
    availableOverall,
    savingsGoal,
    isSavingsCorroded,
    safeSavings,
    cycleInfo,
    totalExtraIncomeSum,
    closingDay,
    currentBankBalance,
    initialBankBalance
  } = useFinance();

  return (
    <>
      <header className="bg-white pt-14 pb-6 px-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-b-3xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">Livre no Cartão</p>
            <h1 className={`text-4xl font-bold tracking-tight ${availableOverall < 0 ? 'text-red-500' : 'text-gray-900'}`}>
              {formatCurrency(availableOverall)}
            </h1>
            
            {(initialBankBalance > 0 || currentBankBalance !== 0) && (
              <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-blue-700 bg-blue-50/70 w-fit px-2.5 py-1 rounded-lg border border-blue-100/50">
                <Landmark size={14} />
                Conta: {formatCurrency(currentBankBalance)}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={onOpenSettings}
              className="p-3 bg-gray-100 rounded-full text-blue-600 hover:bg-gray-200 transition active:scale-95 shadow-sm"
            >
              <Pencil size={20} />
            </button>

            {savingsGoal > 0 && (
              <div className={`flex flex-col items-end ${isSavingsCorroded ? 'text-red-500' : 'text-emerald-500'}`}>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  {isSavingsCorroded ? <AlertTriangle size={12} /> : <PiggyBank size={12} />}
                  Salvo
                </div>
                <span className="font-bold text-sm bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                  {formatCurrency(safeSavings)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium flex items-center gap-1.5">
            <Calendar size={16} className="text-blue-500" />
            Fatura de {cycleInfo.referenceMonthName}
          </span>
          <div className="flex items-center gap-2">
            {totalExtraIncomeSum > 0 && (
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs border border-emerald-100 flex items-center gap-1">
                ＋{formatCurrency(totalExtraIncomeSum)}
              </span>
            )}
            <span className="font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-xs">
              {closingDay ? `Fecha dia ${closingDay}` : 'Mês Civil'}
            </span>
          </div>
        </div>
      </header>

      {isSavingsCorroded && (
        <div className="mx-5 mt-4 bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start shadow-sm">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-red-800">Cuidado!</h4>
            <p className="text-xs text-red-600 mt-1 font-medium">Você estourou seu orçamento e está gastando o dinheiro que havia separado para economizar.</p>
          </div>
        </div>
      )}
    </>
  );
}
