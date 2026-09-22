import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from './contexts/FinanceContext';
import { useTheme } from './hooks/useTheme';
import DashboardHeader from './components/DashboardHeader';
import WeeklyCard from './components/WeeklyCard';
import InitialSetupModal from './components/InitialSetupModal';
import AddExpenseModal from './components/AddExpenseModal';

function App() {
  const { monthlyIncome, weeklyData, addExpense, addExtraIncome } = useFinance();
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-gray-950 font-sans transition-colors duration-300 relative">
      <div className="max-w-5xl mx-auto pb-28">
        
        <DashboardHeader 
          onOpenSettings={() => setIsIncomeModalOpen(true)} 
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="px-5 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {weeklyData.map((week) => (
              <div key={week.weekNumber} className="flex h-fit">
                <WeeklyCard 
                  week={week} 
                  isExpanded={expandedWeek === week.weekNumber}
                  toggleWeek={toggleWeek}
                />
              </div>
            ))}
          </div>
        </main>

        {/* FAB */}
        <button 
          onClick={() => setIsExpenseModalOpen(true)}
          className="fixed bottom-8 right-6 md:right-12 xl:right-auto xl:left-[calc(50%+400px)] z-10 p-4 bg-blue-600 text-white rounded-full shadow-[0_8px_16px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
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
    </div>
  );
}

export default App;
