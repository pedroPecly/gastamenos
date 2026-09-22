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
      <div className={`flex justify-between items-center rounded-xl ${isPassed ? 'bg-emerald-50/60 p-3 border border-emerald-100/60' : 'bg-emerald-50 p-3.5 border border-emerald-100'}`}>
        <div>
          <p className={`text-sm font-bold flex items-center gap-1.5 ${isPassed ? 'text-emerald-700' : 'text-emerald-800'}`}>
            {transaction.description}
            {isBank ? <Landmark size={12} className="text-blue-500" /> : <CreditCard size={12} className="text-gray-400" />}
          </p>
          <p className={`font-medium mt-0.5 ${isPassed ? 'text-[10px] text-emerald-500' : 'text-[11px] text-emerald-400'}`}>
            {formattedDate} · Receita Extra {isBank ? '(Conta)' : '(Ciclo)'}
          </p>
        </div>
        <div className={`flex items-center ${isPassed ? 'gap-2' : 'gap-3'}`}>
          <span className={`font-bold text-emerald-600 ${isPassed ? 'text-sm' : 'text-base'}`}>+{formatCurrency(transaction.amount)}</span>
          <button
            onClick={handleDelete}
            className={`text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 active:scale-95 transition ${isPassed ? 'p-1.5' : 'p-2 bg-white shadow-sm border border-emerald-200/50'}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-between items-center rounded-xl ${isPassed ? 'bg-gray-100/50 p-3' : 'bg-gray-50 p-3.5 border border-gray-100'}`}>
      <div>
        <p className={`text-sm flex items-center gap-1.5 ${isPassed ? 'font-semibold text-gray-700' : 'font-bold text-gray-800'}`}>
          {transaction.description}
          {isBank ? <Landmark size={12} className="text-blue-500" /> : <CreditCard size={12} className="text-gray-400" />}
        </p>
        <p className={`font-medium mt-0.5 ${isPassed ? 'text-[10px] text-gray-500' : 'text-[11px] text-gray-400'}`}>
          {formattedDate} · {isBank ? 'Conta' : 'Cartão'}
        </p>
      </div>
      <div className={`flex items-center ${isPassed ? 'gap-2' : 'gap-3'}`}>
        <span className={`font-bold ${isPassed ? 'text-sm text-gray-600' : 'text-base text-gray-800'}`}>-{formatCurrency(transaction.amount)}</span>
        <button
          onClick={handleDelete}
          className={`text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 active:scale-95 transition ${isPassed ? 'p-1.5' : 'p-2 bg-white shadow-sm border border-gray-200/50'}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
