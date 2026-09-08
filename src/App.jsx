import React, { useState } from 'react';
import { useFinance } from './hooks/useFinance';
import { Plus, Pencil, X, Wallet, Calendar, ChevronDown, ChevronUp, Trash2, PiggyBank, AlertTriangle } from 'lucide-react';
import AddExpenseModal from './components/AddExpenseModal';

function App() {
  const {
    monthlyIncome,
    initialBill,
    closingDay,
    savingsGoal,
    availableOverall,
    safeSavings,
    isSavingsCorroded,
    updateMonthlyIncome,
    addExpense,
    deleteExpense,
    weeklyData,
    cycleInfo
  } = useFinance();

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(monthlyIncome === 0);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);
  
  const [incomeInput, setIncomeInput] = useState(monthlyIncome > 0 ? String(monthlyIncome) : '');
  const [billInput, setBillInput] = useState(initialBill > 0 ? String(initialBill) : '');
  const [closingDayInput, setClosingDayInput] = useState(closingDay ? String(closingDay) : '');
  const [savingsInput, setSavingsInput] = useState(savingsGoal > 0 ? String(savingsGoal) : '');

  const handleSaveIncome = (e) => {
    e.preventDefault();
    if (Number(incomeInput) > 0) {
      updateMonthlyIncome(
        Number(incomeInput), 
        Number(billInput), 
        closingDayInput ? Number(closingDayInput) : null,
        Number(savingsInput)
      );
      setIsIncomeModalOpen(false);
    }
  };

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

  const toggleWeek = (weekNumber) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans relative sm:max-w-md mx-auto sm:border-x sm:border-gray-200">
      {/* Header Estilo iOS */}
      <header className="bg-white pt-14 pb-6 px-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-b-3xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">Total Livre</p>
            <h1 className={`text-4xl font-bold tracking-tight ${availableOverall < 0 ? 'text-red-500' : 'text-gray-900'}`}>
              {formatCurrency(availableOverall)}
            </h1>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={() => setIsIncomeModalOpen(true)}
              className="p-3 bg-gray-100 rounded-full text-blue-600 hover:bg-gray-200 transition active:scale-95"
            >
              <Pencil size={20} />
            </button>

            {/* Badge de Economia Blindada */}
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
          <span className="font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-xs">
            {closingDay ? `Fecha dia ${closingDay}` : 'Mês Civil'}
          </span>
        </div>
      </header>

      {/* Alerta de Corrosão de Economia */}
      {isSavingsCorroded && (
        <div className="mx-5 mt-4 bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start shadow-sm">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-red-800">Cuidado!</h4>
            <p className="text-xs text-red-600 mt-1 font-medium">Você estourou seu orçamento e está gastando o dinheiro que havia separado para economizar.</p>
          </div>
        </div>
      )}

      {/* Lista de Semanas Dinâmica */}
      <main className="px-5 py-6 pb-28 space-y-4">
        {weeklyData.map((week) => {
          const { weekNumber, label, budget, balance, status, totalSpent, expensesList } = week;
          const isExpanded = expandedWeek === weekNumber;
          
          if (status === 'passed') {
            return (
              <div 
                key={weekNumber} 
                onClick={() => toggleWeek(weekNumber)}
                className="bg-transparent border border-gray-200 rounded-2xl p-4 opacity-70 relative overflow-hidden flex flex-col cursor-pointer transition-all hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-600 flex items-center gap-2">
                      Semana {weekNumber}
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md uppercase">Encerrada</span>
                    </h2>
                    <p className="text-xs font-medium text-gray-500 mt-1">
                      {label}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">Gasto Total</p>
                      <span className="text-lg font-bold text-gray-700 block leading-none">
                        {formatCurrency(totalSpent)}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-gray-200/50 space-y-2">
                    {expensesList.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-2">Nenhuma despesa nesta semana.</p>
                    ) : (
                      expensesList.map(exp => (
                        <div key={exp.id} className="flex justify-between items-center bg-gray-100/50 p-3 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">{exp.description}</p>
                            <p className="text-[10px] text-gray-500">{new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-600">-{formatCurrency(exp.amount)}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteExpense(exp.id); }} 
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 active:scale-95 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
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
          
          let textColor = "text-green-500";
          let barColor = "bg-green-500";
          
          if (isNegative) {
            textColor = "text-red-500";
            barColor = "bg-red-500";
          } else if (isWarning) {
            textColor = "text-orange-500";
            barColor = "bg-orange-500";
          }

          return (
            <div 
              key={weekNumber} 
              onClick={() => toggleWeek(weekNumber)}
              className={`bg-white rounded-2xl p-5 shadow-sm border ${isCurrent ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-100'} relative overflow-hidden transition-all cursor-pointer hover:shadow-md`}
            >
              <div className="absolute top-0 right-0 bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider rounded-bl-xl border-l border-b border-gray-100 flex items-center gap-1">
                {isCurrent && <span className="text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded mr-1">ATUAL</span>}
                {label}
              </div>

              <div className="flex justify-between items-end mb-3 mt-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    Semana {weekNumber}
                  </h2>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">
                    Orçamento: {formatCurrency(budget)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-3xl font-bold tracking-tight ${textColor} block leading-none`}>
                      {formatCurrency(balance)}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-1 rounded-full text-gray-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>
              
              <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mt-4">
                <div 
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${isNegative ? 'w-full bg-red-500 opacity-20' : barColor}`}
                  style={{ width: isNegative ? '100%' : `${progress}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400 font-medium">
                  {isNegative ? 'Orçamento estourado!' : `${progress.toFixed(0)}% restante`}
                </p>
                {totalSpent > 0 && (
                  <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                    Gastos: {formatCurrency(totalSpent)}
                  </p>
                )}
              </div>

              {isExpanded && (
                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Lançamentos da Semana</h4>
                  {expensesList.length === 0 ? (
                    <p className="text-sm text-center text-gray-400 py-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      Nenhuma despesa lançada nesta semana.
                    </p>
                  ) : (
                    expensesList.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{exp.description}</p>
                          <p className="text-[11px] font-medium text-gray-400 mt-0.5">{new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-gray-800">-{formatCurrency(exp.amount)}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteExpense(exp.id); }} 
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 active:scale-95 transition bg-white shadow-sm border border-gray-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* FAB */}
      <button 
        onClick={() => setIsExpenseModalOpen(true)}
        className="fixed bottom-8 right-6 z-10 p-4 bg-blue-600 text-white rounded-full shadow-[0_8px_16px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center sm:absolute"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {/* Modals */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:max-w-md mx-auto transition-opacity">
          <div className="bg-white w-full rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-blue-600" /> Configuração Inicial
              </h3>
              {monthlyIncome > 0 && (
                <button onClick={() => setIsIncomeModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 active:scale-95">
                  <X size={20} />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSaveIncome} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Renda Mensal (Teto)</label>
                <p className="text-[11px] text-gray-400 mb-2">Quanto você ganha ou planeja gastar no ciclo?</p>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-gray-400 font-semibold">R$</span>
                  <input
                    type="number"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Dia de Fechamento da Fatura</label>
                <p className="text-[11px] text-gray-400 mb-2">Opcional. Deixe em branco para mês civil.</p>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={closingDayInput}
                  onChange={(e) => setClosingDayInput(e.target.value)}
                  className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold"
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-600 mb-1 flex items-center gap-1">
                  <PiggyBank size={16} /> Meta de Economia
                </label>
                <p className="text-[11px] text-gray-400 mb-2">Opcional. Quanto quer "blindar" para guardar esse mês?</p>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-emerald-400 font-semibold">R$</span>
                  <input
                    type="number"
                    value={savingsInput}
                    onChange={(e) => setSavingsInput(e.target.value)}
                    className="w-full bg-emerald-50 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold text-emerald-700 placeholder-emerald-300"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Fatura Atual</label>
                <p className="text-[11px] text-gray-400 mb-2">Opcional. Despesas já lançadas no cartão antes de usar o app.</p>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-gray-400 font-semibold">R$</span>
                  <input
                    type="number"
                    value={billInput}
                    onChange={(e) => setBillInput(e.target.value)}
                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-red-400 outline-none text-lg font-semibold text-red-600 placeholder-red-300"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl hover:bg-black active:scale-[0.98] transition-all mt-4"
              >
                Salvar Configurações
              </button>
            </form>
          </div>
        </div>
      )}

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={addExpense}
        weeklyData={weeklyData.filter(w => w.status !== 'passed')}
      />
    </div>
  );
}

export default App;
