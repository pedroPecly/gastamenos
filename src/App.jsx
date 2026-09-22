import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from './contexts/FinanceContext';
import DashboardHeader from './components/DashboardHeader';
import WeeklyCard from './components/WeeklyCard';
import InitialSetupModal from './components/InitialSetupModal';
import AddExpenseModal from './components/AddExpenseModal';

function App() {
  const { monthlyIncome, weeklyData, addExpense, addExtraIncome } = useFinance();

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(monthlyIncome === 0);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);
  
  const toggleWeek = (weekNumber) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  const handleTransactionSave = (transaction) => {
    if (transaction.type === 'income') {
      addExtraIncome(transaction);
    } else {
      addExpense(transaction);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans relative sm:max-w-md mx-auto sm:border-x sm:border-gray-200">
      
      <DashboardHeader onOpenSettings={() => setIsIncomeModalOpen(true)} />

      <main className="px-5 py-6 pb-28 space-y-4">
        {weeklyData.map((week) => (
          <WeeklyCard 
            key={week.weekNumber} 
            week={week} 
            isExpanded={expandedWeek === week.weekNumber}
            toggleWeek={toggleWeek}
          />
        ))}
      </main>

      {/* FAB */}
      <button 
        onClick={() => setIsExpenseModalOpen(true)}
        className="fixed bottom-8 right-6 z-10 p-4 bg-blue-600 text-white rounded-full shadow-[0_8px_16px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center sm:absolute"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {/* Modals */}
      <InitialSetupModal 
        isOpen={isIncomeModalOpen} 
        onClose={() => setIsIncomeModalOpen(false)} 
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleTransactionSave}
        weeklyData={weeklyData.filter(w => w.status !== 'passed')}
      />
    </div>
  );
}

export default App;
