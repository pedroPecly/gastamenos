import { Trash2, CreditCard, Landmark } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function TransactionItem({ transaction, isPassed, isIncome }) {
  const { deleteExpense, deleteExtraIncome } = useFinance();

  const handleDelete = (e) => {
    e.stopPropagation();
    if (isIncome) {
      deleteExtraIncome(transaction.id);
    } else {
      deleteExpense(transaction.id);
    }
  };

  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR');
  const isBank = transaction.source === 'bank';

  if (isIncome) {
    return (
      <div className={`flex justify-between items-center rounded-xl ${isPassed ? 'bg-emerald-50/60 dark:bg-emerald-900/10 p-3 border border-emerald-100/60 dark:border-emerald-900/30' : 'bg-emerald-50 dark:bg-emerald-900/20 p-3.5 border border-emerald-100 dark:border-emerald-800/50'}`}>
        <div>
          <p className={`text-sm font-bold flex items-center gap-1.5 ${isPassed ? 'text-emerald-700 dark:text-emerald-500' : 'text-emerald-800 dark:text-emerald-400'}`}>
            {transaction.description}
            {isBank ? <Landmark size={12} className="text-blue-500 dark:text-blue-400" /> : <CreditCard size={12} className="text-gray-400 dark:text-gray-500" />}
          </p>
          <p className={`font-medium mt-0.5 ${isPassed ? 'text-[10px] text-emerald-500 dark:text-emerald-600' : 'text-[11px] text-emerald-400 dark:text-emerald-500'}`}>
            {formattedDate} · Receita Extra {isBank ? '(Conta)' : '(Ciclo)'}
          </p>
        </div>
        <div className={`flex items-center ${isPassed ? 'gap-2' : 'gap-3'}`}>
          <span className={`font-bold text-emerald-600 dark:text-emerald-400 ${isPassed ? 'text-sm' : 'text-base'}`}>+{formatCurrency(transaction.amount)}</span>
          <button
            onClick={handleDelete}
            className={`text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 active:scale-95 transition ${isPassed ? 'p-1.5' : 'p-2 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border border-emerald-200/50 dark:border-gray-700'}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-between items-center rounded-xl ${isPassed ? 'bg-gray-100/50 dark:bg-gray-800/50 p-3' : 'bg-gray-50 dark:bg-gray-800/80 p-3.5 border border-gray-100 dark:border-gray-800'}`}>
      <div>
        <p className={`text-sm flex items-center gap-1.5 ${isPassed ? 'font-semibold text-gray-700 dark:text-gray-300' : 'font-bold text-gray-800 dark:text-gray-100'}`}>
          {transaction.description}
          {isBank ? <Landmark size={12} className="text-blue-500 dark:text-blue-400" /> : <CreditCard size={12} className="text-gray-400 dark:text-gray-500" />}
        </p>
        <p className={`font-medium mt-0.5 ${isPassed ? 'text-[10px] text-gray-500 dark:text-gray-500' : 'text-[11px] text-gray-400 dark:text-gray-400'}`}>
          {formattedDate} · {isBank ? 'Conta' : 'Cartão'}
        </p>
      </div>
      <div className={`flex items-center ${isPassed ? 'gap-2' : 'gap-3'}`}>
        <span className={`font-bold ${isPassed ? 'text-sm text-gray-600 dark:text-gray-400' : 'text-base text-gray-800 dark:text-gray-200'}`}>-{formatCurrency(transaction.amount)}</span>
        <button
          onClick={handleDelete}
          className={`text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 active:scale-95 transition ${isPassed ? 'p-1.5' : 'p-2 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border border-gray-200/50 dark:border-gray-700'}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
