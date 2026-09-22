import { createContext, useContext } from 'react';
import { useFinance as useFinanceHook } from '../hooks/useFinance';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const finance = useFinanceHook();

  return (
    <FinanceContext.Provider value={finance}>
      {children}
    </FinanceContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
