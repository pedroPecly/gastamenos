import { useState, useEffect, useMemo } from 'react';
import { getCycleId, calculateCycleInfoFromId, calculateWeeklyData } from '../utils/dateEngine';

const STORAGE_KEY = '@financeApp:state';

export function useFinance() {
  const [state, setState] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      
      // Migration to cycleSettings
      if (parsed.monthlyIncome !== undefined && !parsed.cycleSettings) {
        const currentId = getCycleId(new Date(), parsed.closingDay);
        parsed.cycleSettings = {
          [currentId]: {
            monthlyIncome: parsed.monthlyIncome || 0,
            initialBill: parsed.initialBill || 0,
            savingsGoal: parsed.savingsGoal || 0
          }
        };
        delete parsed.monthlyIncome;
        delete parsed.initialBill;
        delete parsed.savingsGoal;
      }

      return {
        ...parsed,
        closingDay: parsed.closingDay || null,
        initialBankBalance: parsed.initialBankBalance || 0,
        extraIncome: parsed.extraIncome || [],
        cycleSettings: parsed.cycleSettings || {}
      };
    }
    return {
      closingDay: null,
      initialBankBalance: 0,
      expenses: [],
      extraIncome: [],
      cycleSettings: {}
    };
  });

  const [selectedCycleId, setSelectedCycleId] = useState(() => getCycleId(new Date(), state.closingDay));

  const getFallbackSettings = (cycleSettings, targetId) => {
    const sortedIds = Object.keys(cycleSettings).sort();
    const pastIds = sortedIds.filter(id => id < targetId);
    if (pastIds.length > 0) {
      const lastSettings = cycleSettings[pastIds[pastIds.length - 1]];
      return {
        monthlyIncome: lastSettings.monthlyIncome,
        initialBill: 0,
        savingsGoal: lastSettings.savingsGoal
      };
    }
    return { monthlyIncome: 0, initialBill: 0, savingsGoal: 0 };
  };

  const currentSettings = state.cycleSettings[selectedCycleId] || getFallbackSettings(state.cycleSettings, selectedCycleId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateMonthlyIncome = (newIncome, newInitialBill = 0, newClosingDay = null, newSavingsGoal = 0, newBankBalance = 0) => {
    setState((prevState) => ({
      ...prevState,
      closingDay: newClosingDay,
      initialBankBalance: newBankBalance,
      cycleSettings: {
        ...prevState.cycleSettings,
        [selectedCycleId]: {
          monthlyIncome: newIncome,
          initialBill: newInitialBill,
          savingsGoal: newSavingsGoal
        }
      }
    }));
  };

  const changeCycle = (direction) => {
    const [yearStr, monthStr] = selectedCycleId.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + direction;
    if (month > 12) {
      month = 1;
      year++;
    } else if (month < 1) {
      month = 12;
      year--;
    }
    setSelectedCycleId(`${year}-${String(month).padStart(2, '0')}`);
  };

  // ----- DESPESAS -----

  const addExpense = (expense) => {
    setState((prevState) => ({
      ...prevState,
      expenses: [
        ...prevState.expenses,
        {
          ...expense,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          source: expense.source || 'credit' // Fallback para manter retrocompatibilidade
        }
      ]
    }));
  };

  const deleteExpense = (id) => {
    setState((prevState) => ({
      ...prevState,
      expenses: prevState.expenses.filter((expense) => expense.id !== id)
    }));
  };

  // ----- RECEITAS EXTRAS -----

  const addExtraIncome = (income) => {
    setState((prevState) => ({
      ...prevState,
      extraIncome: [
        ...prevState.extraIncome,
        {
          ...income,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          source: income.source || 'credit'
        }
      ]
    }));
  };

  const deleteExtraIncome = (id) => {
    setState((prevState) => ({
      ...prevState,
      extraIncome: prevState.extraIncome.filter((income) => income.id !== id)
    }));
  };

  // ----- MOTOR DO CICLO FINANCEIRO -----

  const cycleInfo = useMemo(() => {
    return calculateCycleInfoFromId(selectedCycleId, state.closingDay);
  }, [selectedCycleId, state.closingDay]);

  const currentCycleExpenses = useMemo(() => {
    return state.expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const expDateMidnight = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
      return expDateMidnight >= cycleInfo.start && expDateMidnight <= cycleInfo.end;
    });
  }, [state.expenses, cycleInfo]);

  const currentCycleExtraIncome = useMemo(() => {
    return state.extraIncome.filter(inc => {
      const incDate = new Date(inc.date);
      const incDateMidnight = new Date(incDate.getFullYear(), incDate.getMonth(), incDate.getDate());
      return incDateMidnight >= cycleInfo.start && incDateMidnight <= cycleInfo.end;
    });
  }, [state.extraIncome, cycleInfo]);

  const weeklyData = useMemo(() => {
    return calculateWeeklyData({
      monthlyIncome: currentSettings.monthlyIncome,
      initialBill: currentSettings.initialBill,
      savingsGoal: currentSettings.savingsGoal,
      currentCycleExpenses,
      currentCycleExtraIncome,
      cycleInfo
    });
  }, [currentSettings, currentCycleExpenses, currentCycleExtraIncome, cycleInfo]);

  // ----- CÁLCULOS GERAIS -----

  // Filtramos os gastos e rendimentos apenas do cartão/ciclo (ignoramos os da conta bancária)
  const totalExpensesCredit = currentCycleExpenses
    .filter(e => e.source !== 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExtraIncomeCredit = currentCycleExtraIncome
    .filter(i => i.source !== 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // totalSpent: total de saídas do ciclo do cartão
  const totalSpent = totalExpensesCredit + currentSettings.initialBill;

  // availableOverall: renda + receitas extras no cartão − gastos no cartão − meta de economia
  const rawAvailable = currentSettings.monthlyIncome + totalExtraIncomeCredit - totalSpent;
  const availableOverall = rawAvailable - currentSettings.savingsGoal;

  // Economia Blindada
  const safeSavings = Math.max(0, currentSettings.savingsGoal + Math.min(0, availableOverall));
  const isSavingsCorroded = currentSettings.savingsGoal > 0 && safeSavings < currentSettings.savingsGoal;

  // ----- CÁLCULOS DA CONTA BANCÁRIA -----
  const bankExpensesSum = state.expenses
    .filter(e => e.source === 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const bankIncomesSum = state.extraIncome
    .filter(i => i.source === 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBankBalance = state.initialBankBalance - bankExpensesSum + bankIncomesSum;

  return {
    monthlyIncome: currentSettings.monthlyIncome,
    initialBill: currentSettings.initialBill,
    savingsGoal: currentSettings.savingsGoal,
    closingDay: state.closingDay,
    initialBankBalance: state.initialBankBalance,
    currentBankBalance,
    availableOverall,
    safeSavings,
    isSavingsCorroded,
    totalSpent,
    totalExtraIncomeSum: totalExtraIncomeCredit,
    expenses: currentCycleExpenses,
    extraIncome: currentCycleExtraIncome,
    updateMonthlyIncome,
    addExpense,
    deleteExpense,
    addExtraIncome,
    deleteExtraIncome,
    weeklyData,
    cycleInfo,
    selectedCycleId,
    changeCycle
  };
}
