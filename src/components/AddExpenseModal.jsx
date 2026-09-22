import { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, CreditCard, Landmark } from 'lucide-react';

export default function AddExpenseModal({ isOpen, onClose, onSave, weeklyData }) {
  const [transactionType, setTransactionType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [source, setSource] = useState('credit'); // 'credit' | 'bank'

  useEffect(() => {
    if (isOpen && weeklyData.length > 0 && !selectedWeek) {
      const currentWeek = weeklyData.find(w => w.status === 'current');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedWeek(currentWeek ? currentWeek.weekNumber : weeklyData[0].weekNumber);
    }
  }, [isOpen, weeklyData, selectedWeek]);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactionType('expense');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSource('credit');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isIncome = transactionType === 'income';

  const handleSave = (e) => {
    e.preventDefault();
    if (description && Number(amount) > 0 && selectedWeek) {
      onSave({
        description,
        amount: Number(amount),
        weekNumber: selectedWeek,
        type: transactionType,
        source: source
      });
      setAmount('');
      setDescription('');
      setSource('credit');
      onClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setSource('credit');
    onClose();
  };

  const palette = isIncome
    ? {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-100 dark:border-emerald-900/50',
        amountColor: 'text-emerald-600 dark:text-emerald-400',
        prefixColor: 'text-emerald-400 dark:text-emerald-500',
        pillActive: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm dark:shadow-none',
        pillActiveLabel: 'text-emerald-500 dark:text-emerald-400',
        btnBg: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-emerald-500/30 dark:shadow-none',
        inputFocus: 'focus:ring-emerald-400',
        labelColor: 'text-gray-500 dark:text-gray-400'
      }
    : {
        bg: 'bg-gray-50 dark:bg-gray-800',
        border: 'border-gray-100 dark:border-gray-700',
        amountColor: 'text-gray-900 dark:text-white',
        prefixColor: 'text-gray-400 dark:text-gray-500',
        pillActive: 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm dark:shadow-none',
        pillActiveLabel: 'text-blue-500 dark:text-blue-400',
        btnBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-600/30 dark:shadow-none',
        inputFocus: 'focus:ring-blue-500',
        labelColor: 'text-gray-500 dark:text-gray-400'
      };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity px-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform animate-slide-up flex flex-col max-h-[90vh] overflow-hidden border border-transparent dark:border-gray-800">

        {/* Sticky Header */}
        <div className="flex justify-between items-center p-6 sm:p-8 pb-5 shrink-0 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isIncome ? 'Receita Extra' : 'Nova Despesa'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 pt-5 flex-1">
          {/* Toggle Despesa / Receita Extra */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setTransactionType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                !isIncome
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm dark:shadow-none'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <TrendingDown size={16} className={!isIncome ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'} />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                isIncome
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm dark:shadow-none'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <TrendingUp size={16} className={isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'} />
              Receita Extra
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col space-y-6">

            {/* Valor */}
            <div className={`flex flex-col items-center justify-center py-6 ${palette.bg} rounded-3xl border ${palette.border}`}>
              <span className={`text-sm font-medium ${isIncome ? 'text-emerald-500/70 dark:text-emerald-600/70' : 'text-gray-400 dark:text-gray-500'} mb-2 uppercase tracking-wide`}>
                {isIncome ? 'Valor recebido' : 'Qual o valor?'}
              </span>
              <div className={`flex items-center text-5xl font-bold ${palette.amountColor}`}>
                <span className={`text-2xl ${palette.prefixColor} mr-2 mt-2`}>
                  {isIncome ? '+R$' : 'R$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-36 bg-transparent border-0 p-0 text-center focus:ring-0 outline-none placeholder-gray-300 dark:placeholder-gray-600`}
                  placeholder="0.00"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Origem do Dinheiro (Cartão ou Conta) */}
            <div>
              <label className={`block text-sm font-medium ${palette.labelColor} mb-2 ml-1`}>
                {isIncome ? 'Destino do Dinheiro' : 'Origem do Pagamento'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSource('credit')}
                  className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    source === 'credit'
                      ? palette.pillActive
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <CreditCard size={18} className="mb-1" />
                  Cartão (Ciclo)
                </button>
                <button
                  type="button"
                  onClick={() => setSource('bank')}
                  className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    source === 'bank'
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm dark:shadow-none'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Landmark size={18} className="mb-1" />
                  Conta (Bancária)
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className={`block text-sm font-medium ${palette.labelColor} mb-2 ml-1`}>
                {isIncome ? 'Origem do valor' : 'Descrição'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 focus:ring-2 ${palette.inputFocus} outline-none text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all`}
                placeholder={isIncome ? 'Ex: Freelance, Venda, Bônus...' : 'Ex: Almoço, Uber, Mercado...'}
                required
              />
            </div>

            {/* Seletor de Semana */}
            <div>
              <label className={`block text-sm font-medium ${palette.labelColor} mb-2 ml-1`}>
                {isIncome ? 'Semana de entrada' : 'Semana Relacionada'}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {weeklyData.map((week) => {
                  const isSelected = selectedWeek === week.weekNumber;
                  return (
                    <button
                      key={week.weekNumber}
                      type="button"
                      onClick={() => setSelectedWeek(week.weekNumber)}
                      className={`flex-shrink-0 py-3 px-3 rounded-xl text-sm font-bold border-2 transition-all ${
                        isSelected
                          ? palette.pillActive
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      style={{ minWidth: '72px' }}
                    >
                      <div className="block leading-tight">Sem. {week.weekNumber}</div>
                      <div className={`text-[10px] font-medium mt-1 truncate ${isSelected ? palette.pillActiveLabel : 'text-gray-400 dark:text-gray-500'}`}>
                        {week.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full ${palette.btnBg} text-white font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all mt-2`}
            >
              {isIncome ? '＋ Registrar Receita' : 'Salvar Despesa'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
