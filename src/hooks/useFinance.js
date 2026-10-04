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
        pendingIncomes: parsed.pendingIncomes || [],
        cycleSettings: parsed.cycleSettings || {},
        budgetMode: parsed.budgetMode || 'equal'
      };
    }
    return {
      closingDay: null,
      initialBankBalance: 0,
      expenses: [],
      extraIncome: [],
      pendingIncomes: [],
      cycleSettings: {},
      budgetMode: 'equal'
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
        savingsGoal: lastSettings.savingsGoal,
        initialBankBalance: lastSettings.initialBankBalance
      };
    }
    return { monthlyIncome: 0, initialBill: 0, savingsGoal: 0, initialBankBalance: undefined };
  };

  const fallbackSettings = getFallbackSettings(state.cycleSettings, selectedCycleId);
  const cycleSetting = state.cycleSettings[selectedCycleId] || {};
  
  const currentSettings = {
    monthlyIncome: cycleSetting.monthlyIncome ?? fallbackSettings.monthlyIncome ?? 0,
    initialBill: cycleSetting.initialBill ?? fallbackSettings.initialBill ?? 0,
    savingsGoal: cycleSetting.savingsGoal ?? fallbackSettings.savingsGoal ?? 0,
    initialBankBalance: cycleSetting.initialBankBalance ?? fallbackSettings.initialBankBalance ?? state.initialBankBalance ?? 0
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateMonthlyIncome = (newIncome, newInitialBill = 0, newClosingDay = null, newSavingsGoal = 0, newBankBalance = 0, newBudgetMode = 'equal') => {
    setState((prevState) => ({
      ...prevState,
      closingDay: newClosingDay,
      initialBankBalance: newBankBalance,
      budgetMode: newBudgetMode,
      cycleSettings: {
        ...prevState.cycleSettings,
        [selectedCycleId]: {
          monthlyIncome: newIncome,
          initialBill: newInitialBill,
          savingsGoal: newSavingsGoal,
          initialBankBalance: newBankBalance
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

  // ----- DINHEIRO PENDENTE (A RECEBER) -----

  const addPendingIncome = (income) => {
    setState((prevState) => ({
      ...prevState,
      pendingIncomes: [
        ...prevState.pendingIncomes,
        {
          ...income,
          id: crypto.randomUUID(),
          date: new Date().toISOString()
        }
      ]
    }));
  };

  const deletePendingIncome = (id) => {
    setState((prevState) => ({
      ...prevState,
      pendingIncomes: prevState.pendingIncomes.filter((income) => income.id !== id)
    }));
  };

  const receivePendingIncome = (id, targetWeek, targetSource = 'credit') => {
    setState((prevState) => {
      const pendingItem = prevState.pendingIncomes.find((item) => item.id === id);
      if (!pendingItem) return prevState;

      return {
        ...prevState,
        pendingIncomes: prevState.pendingIncomes.filter((item) => item.id !== id),
        extraIncome: [
          ...prevState.extraIncome,
          {
            description: pendingItem.description,
            amount: pendingItem.amount,
            weekNumber: targetWeek,
            type: 'income',
            source: targetSource,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
          }
        ]
      };
    });
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
      budgetMode: state.budgetMode,
      currentCycleExpenses,
      currentCycleExtraIncome,
      cycleInfo
    });
  }, [currentSettings, state.budgetMode, currentCycleExpenses, currentCycleExtraIncome, cycleInfo]);

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
  const bankExpensesSum = currentCycleExpenses
    .filter(e => e.source === 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const bankIncomesSum = currentCycleExtraIncome
    .filter(i => i.source === 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBankBalance = currentSettings.initialBankBalance - bankExpensesSum + bankIncomesSum;

  return {
    monthlyIncome: currentSettings.monthlyIncome,
    initialBill: currentSettings.initialBill,
    savingsGoal: currentSettings.savingsGoal,
    closingDay: state.closingDay,
    initialBankBalance: currentSettings.initialBankBalance,
    budgetMode: state.budgetMode,
    currentBankBalance,
    availableOverall,
    safeSavings,
    isSavingsCorroded,
    totalSpent,
    totalExtraIncomeSum: totalExtraIncomeCredit,
    expenses: currentCycleExpenses,
    extraIncome: currentCycleExtraIncome,
    pendingIncomes: state.pendingIncomes,
    updateMonthlyIncome,
    addExpense,
    deleteExpense,
    addExtraIncome,
    deleteExtraIncome,
    addPendingIncome,
    deletePendingIncome,
    receivePendingIncome,
    weeklyData,
    cycleInfo,
    selectedCycleId,
    changeCycle
  };
}
