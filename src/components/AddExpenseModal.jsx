import React, { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp } from 'lucide-react';

export default function AddExpenseModal({ isOpen, onClose, onSave, weeklyData }) {
  const [transactionType, setTransactionType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Seleciona a semana atual por padrão ao abrir o modal
  useEffect(() => {
    if (isOpen && weeklyData.length > 0 && !selectedWeek) {
      const currentWeek = weeklyData.find(w => w.status === 'current');
      setSelectedWeek(currentWeek ? currentWeek.weekNumber : weeklyData[0].weekNumber);
    }
  }, [isOpen, weeklyData, selectedWeek]);

  // Reseta tipo ao fechar
  useEffect(() => {
    if (!isOpen) {
      setTransactionType('expense');
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
        type: transactionType
      });
      setAmount('');
      setDescription('');
      onClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    onClose();
  };

  // Paleta de cores dinâmica por tipo
  const palette = isIncome
    ? {
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        amountColor: 'text-emerald-600',
        prefixColor: 'text-emerald-400',
        focusRing: 'focus:ring-emerald-400',
        pillActive: 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm',
        pillActiveLabel: 'text-emerald-500',
        btnBg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
        inputFocus: 'focus:ring-emerald-400',
        labelColor: 'text-gray-500'
      }
    : {
        bg: 'bg-gray-50',
        border: 'border-gray-100',
        amountColor: 'text-gray-900',
        prefixColor: 'text-gray-400',
        focusRing: 'focus:ring-blue-500',
        pillActive: 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm',
        pillActiveLabel: 'text-blue-500',
        btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30',
        inputFocus: 'focus:ring-blue-500',
        labelColor: 'text-gray-500'
      };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:max-w-md mx-auto transition-opacity">
      <div className="bg-white w-full rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-slide-up flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">
            {isIncome ? 'Receita Extra' : 'Nova Despesa'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 active:scale-95 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toggle Despesa / Receita Extra */}
        <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setTransactionType('expense')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
              !isIncome
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingDown size={16} className={!isIncome ? 'text-red-500' : 'text-gray-400'} />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('income')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
              isIncome
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingUp size={16} className={isIncome ? 'text-emerald-500' : 'text-gray-400'} />
            Receita Extra
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col space-y-5 overflow-y-auto">

          {/* Valor */}
          <div className={`flex flex-col items-center justify-center py-6 ${palette.bg} rounded-3xl border ${palette.border}`}>
            <span className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
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
                className={`w-36 bg-transparent border-0 p-0 text-center focus:ring-0 outline-none placeholder-gray-300`}
                placeholder="0.00"
                autoFocus
                required
              />
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
              className={`w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 ${palette.inputFocus} focus:bg-white outline-none text-base font-medium transition-all`}
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
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                    }`}
                    style={{ minWidth: '72px' }}
                  >
                    <div className="block leading-tight">Sem. {week.weekNumber}</div>
                    <div className={`text-[10px] font-medium mt-1 truncate ${isSelected ? palette.pillActiveLabel : 'text-gray-400'}`}>
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
  );
}
