import { useState, useEffect } from 'react';
import { X, HandCoins, CheckCircle2, Trash2, Plus, CreditCard, Landmark } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import CurrencyInput from './CurrencyInput';

export default function PendingIncomesModal({ isOpen, onClose }) {
  const { pendingIncomes, addPendingIncome, deletePendingIncome, receivePendingIncome, weeklyData } = useFinance();

  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  
  // State for receiving process
  const [receivingId, setReceivingId] = useState(null);
  const [receiveWeek, setReceiveWeek] = useState('');
  const [receiveSource, setReceiveSource] = useState('credit');

  useEffect(() => {
    if (isOpen) {
      setIsAdding(false);
      setReceivingId(null);
      setDescription('');
      setAmount('');
      setDate('');
      
      const currentWeek = weeklyData.find(w => w.status === 'current');
      setReceiveWeek(currentWeek ? currentWeek.weekNumber : (weeklyData[0]?.weekNumber || 1));
      setReceiveSource('credit');
    }
  }, [isOpen, weeklyData]);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (description && Number(amount) > 0) {
      addPendingIncome({
        description,
        amount: Number(amount),
        date: date ? new Date(`${date}T12:00:00`).toISOString() : undefined // Evita fuso horário adiantando a data
      });
      setDescription('');
      setAmount('');
      setDate('');
      setIsAdding(false);
    }
  };

  const handleReceiveSubmit = (e, id) => {
    e.preventDefault();
    if (receiveWeek) {
      receivePendingIncome(id, Number(receiveWeek), receiveSource);
      setReceivingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity px-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg md:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform animate-slide-up flex flex-col max-h-[90vh] overflow-hidden border border-transparent dark:border-gray-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 sm:p-8 pb-5 shrink-0 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HandCoins className="text-amber-500" /> Dinheiro a Receber
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 active:scale-95 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 sm:p-8 pt-5 flex-1 bg-gray-50/50 dark:bg-gray-900/50">
          
          {/* Add Form */}
          {isAdding ? (
            <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 animate-fade-in">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Novo valor a receber</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none text-sm text-gray-900 dark:text-white"
                    placeholder="Ex: perilo como sempre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 font-semibold text-sm">R$</span>
                    <CurrencyInput
                      value={amount}
                      onChange={(val) => setAmount(val)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-amber-500 outline-none text-sm font-semibold text-gray-900 dark:text-white"
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">
                    Data da Dívida <span className="text-[10px] text-gray-400 normal-case font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-md shadow-amber-500/20">Salvar</button>
                </div>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-400 font-bold hover:border-amber-400 hover:text-amber-500 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors mb-6"
            >
              <Plus size={18} /> Registrar Dinheiro Pendente
            </button>
          )}

          {/* List */}
          <div className="space-y-3">
            {pendingIncomes.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                Ninguém está te devendo dinheiro no momento.
              </div>
            ) : (
              pendingIncomes.map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3">
                  
                  {receivingId === item.id ? (
                    <form onSubmit={(e) => handleReceiveSubmit(e, item.id)} className="space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Recebendo: {item.description}</span>
                        <span className="text-emerald-500 font-bold">+ R$ {item.amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Destino</label>
                          <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setReceiveSource('credit')}
                              className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${receiveSource === 'credit' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-400'}`}
                              title="Cartão/Ciclo"
                            >
                              <CreditCard size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setReceiveSource('bank')}
                              className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${receiveSource === 'bank' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'text-gray-400'}`}
                              title="Conta Bancária"
                            >
                              <Landmark size={14} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Semana</label>
                          <select 
                            value={receiveWeek} 
                            onChange={(e) => setReceiveWeek(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-900 border-0 rounded-lg p-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-emerald-500 h-[28px]"
                          >
                            {weeklyData.map(w => (
                              <option key={w.weekNumber} value={w.weekNumber}>Semana {w.weekNumber}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setReceivingId(null)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 size={14} /> Confirmar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-gray-800 dark:text-gray-200 leading-tight">{item.description}</h5>
                          <p className="text-xs text-gray-400 mt-1">Registrado em {new Date(item.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className="font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg text-sm">
                          R$ {item.amount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-1 border-t border-gray-50 dark:border-gray-700/50 pt-3">
                        <button 
                          onClick={() => setReceivingId(item.id)}
                          className="flex-1 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <HandCoins size={14} /> Receber Agora
                        </button>
                        <button 
                          onClick={() => deletePendingIncome(item.id)}
                          className="p-2 bg-red-50 text-red-500 dark:bg-red-900/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
