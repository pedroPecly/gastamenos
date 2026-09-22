import { ChevronDown, ChevronUp } from 'lucide-react';
import TransactionItem from './TransactionItem';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const calculateProgress = (balance, budget) => {
  if (budget === 0) return 0;
  if (balance <= 0) return 0;
  const progress = (balance / budget) * 100;
  return Math.min(progress, 100);
};

export default function WeeklyCard({ week, isExpanded, toggleWeek }) {
  const { weekNumber, label, budget, balance, status, totalSpent, expensesList, extraIncomeList, totalExtraIncome } = week;

  if (status === 'passed') {
    return (
      <div 
        onClick={() => toggleWeek(weekNumber)}
        className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-2xl p-4 opacity-70 relative overflow-hidden flex flex-col cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
              Semana {weekNumber}
              <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md uppercase">Encerrada</span>
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              {label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">Gasto Total</p>
              <span className="text-lg font-bold text-gray-700 dark:text-gray-200 block leading-none">
                {formatCurrency(totalSpent)}
              </span>
            </div>
            {isExpanded ? <ChevronUp size={20} className="text-gray-400 dark:text-gray-500" /> : <ChevronDown size={20} className="text-gray-400 dark:text-gray-500" />}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-800 space-y-2">
            {expensesList.length === 0 && extraIncomeList.length === 0 ? (
              <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-2">Nenhum lançamento nesta semana.</p>
            ) : (
              <>
                {expensesList.map(exp => (
                  <TransactionItem key={exp.id} transaction={exp} isPassed={true} isIncome={false} />
                ))}
                {extraIncomeList.map(inc => (
                  <TransactionItem key={inc.id} transaction={inc} isPassed={true} isIncome={true} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  const isNegative = balance < 0;
  const isWarning = balance > 0 && balance < budget * 0.2;
  const progress = calculateProgress(balance, budget);
  const isCurrent = status === 'current';
  
  let textColor = "text-green-500 dark:text-green-400";
  let barColor = "bg-green-500 dark:bg-green-400";
  
  if (isNegative) {
    textColor = "text-red-500 dark:text-red-400";
    barColor = "bg-red-500 dark:bg-red-500";
  } else if (isWarning) {
    textColor = "text-orange-500 dark:text-orange-400";
    barColor = "bg-orange-500 dark:bg-orange-500";
  }

  return (
    <div 
      onClick={() => toggleWeek(weekNumber)}
      className={`w-full bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-none border ${isCurrent ? 'border-blue-400 ring-2 ring-blue-50 dark:ring-blue-900/30 dark:border-blue-500' : 'border-gray-100 dark:border-gray-800'} relative overflow-hidden transition-all cursor-pointer hover:shadow-md dark:hover:bg-gray-800/80`}
    >
      <div className="absolute top-0 right-0 bg-gray-50 dark:bg-gray-800 px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider rounded-bl-xl border-l border-b border-gray-100 dark:border-gray-800 flex items-center gap-1">
        {isCurrent && <span className="text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded mr-1">ATUAL</span>}
        {label}
      </div>

      <div className="flex justify-between items-end mb-3 mt-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            Semana {weekNumber}
          </h2>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">
            Orçamento: {formatCurrency(budget)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`text-3xl font-bold tracking-tight ${textColor} block leading-none`}>
              {formatCurrency(balance)}
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-1 rounded-full text-gray-400 dark:text-gray-500">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>
      
      <div className="relative w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-4">
        <div 
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${isNegative ? 'w-full bg-red-500 opacity-20' : barColor}`}
          style={{ width: isNegative ? '100%' : `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {isNegative ? 'Orçamento estourado!' : `${progress.toFixed(0)}% restante`}
        </p>
        <div className="flex items-center gap-2">
          {totalExtraIncome > 0 && (
            <p className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold">
              +{formatCurrency(totalExtraIncome)}
            </p>
          )}
          {totalSpent > 0 && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold">
              -{formatCurrency(totalSpent)}
            </p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Lançamentos da Semana</h4>
          {expensesList.length === 0 && extraIncomeList.length === 0 ? (
            <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              Nenhum lançamento nesta semana.
            </p>
          ) : (
            <>
              {expensesList.map(exp => (
                <TransactionItem key={exp.id} transaction={exp} isPassed={false} isIncome={false} />
              ))}
              {extraIncomeList.map(inc => (
                <TransactionItem key={inc.id} transaction={inc} isPassed={false} isIncome={true} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
