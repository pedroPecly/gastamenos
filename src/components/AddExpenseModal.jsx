import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddExpenseModal({ isOpen, onClose, onSave, weeklyData }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Seleciona a semana atual por padrão ao abrir o modal
  useEffect(() => {
    if (isOpen && weeklyData.length > 0 && !selectedWeek) {
      // Procura a primeira semana que seja 'current'
      const currentWeek = weeklyData.find(w => w.status === 'current');
      setSelectedWeek(currentWeek ? currentWeek.weekNumber : weeklyData[0].weekNumber);
    }
  }, [isOpen, weeklyData, selectedWeek]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (description && Number(amount) > 0 && selectedWeek) {
      onSave({
        description,
        amount: Number(amount),
        weekNumber: selectedWeek
      });
      // Limpa os campos após salvar
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:max-w-md mx-auto transition-opacity">
      <div className="bg-white w-full rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-slide-up flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Nova Despesa</h3>
          <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 active:scale-95 transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="flex flex-col space-y-6 overflow-y-auto">
          
          {/* Valor (Grande estilo iOS) */}
          <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-3xl border border-gray-100">
            <span className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Qual o valor?</span>
            <div className="flex items-center text-5xl font-bold text-gray-900">
              <span className="text-2xl text-gray-400 mr-2 mt-2">R$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-36 bg-transparent border-0 p-0 text-center focus:ring-0 outline-none placeholder-gray-300"
                placeholder="0.00"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-base font-medium transition-all"
              placeholder="Ex: Almoço, Uber, Mercado..."
              required
            />
          </div>

          {/* Seletor Visual de Semana (Pills) */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Semana Relacionada</label>
            <div className="flex flex-wrap gap-2">
              {weeklyData.map((week) => {
                const isSelected = selectedWeek === week.weekNumber;
                return (
                  <button
                    key={week.weekNumber}
                    type="button"
                    onClick={() => setSelectedWeek(week.weekNumber)}
                    className={`flex-1 min-w-[90px] py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="block leading-tight">Sem. {week.weekNumber}</div>
                    <div className={`text-[10px] font-medium mt-1 truncate ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                      {week.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4"
          >
            Salvar Despesa
          </button>
        </form>
      </div>
    </div>
  );
}
