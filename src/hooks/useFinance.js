import { useState, useEffect, useMemo } from 'react';
import { calculateCycleInfo, calculateWeeklyData } from '../utils/dateEngine';

const STORAGE_KEY = '@financeApp:state';

export function useFinance() {
  const [state, setState] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        ...parsed,
        initialBill: parsed.initialBill || 0,
        closingDay: parsed.closingDay || null,
        savingsGoal: parsed.savingsGoal || 0,
        initialBankBalance: parsed.initialBankBalance || 0,
        extraIncome: parsed.extraIncome || []
      };
    }
    return {
      monthlyIncome: 0,
      initialBill: 0,
      closingDay: null,
      savingsGoal: 0,
      initialBankBalance: 0,
      expenses: [],
      extraIncome: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateMonthlyIncome = (newIncome, newInitialBill = 0, newClosingDay = null, newSavingsGoal = 0, newBankBalance = 0) => {
    setState((prevState) => ({
      ...prevState,
      monthlyIncome: newIncome,
      initialBill: newInitialBill,
      closingDay: newClosingDay,
      savingsGoal: newSavingsGoal,
      initialBankBalance: newBankBalance
    }));
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
    return calculateCycleInfo(state.closingDay);
  }, [state.closingDay]);

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
      monthlyIncome: state.monthlyIncome,
      initialBill: state.initialBill,
      savingsGoal: state.savingsGoal,
      currentCycleExpenses,
      currentCycleExtraIncome,
      cycleInfo
    });
  }, [state.monthlyIncome, state.initialBill, state.savingsGoal, currentCycleExpenses, currentCycleExtraIncome, cycleInfo]);

  // ----- CÁLCULOS GERAIS -----

  // Filtramos os gastos e rendimentos apenas do cartão/ciclo (ignoramos os da conta bancária)
  const totalExpensesCredit = currentCycleExpenses
    .filter(e => e.source !== 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExtraIncomeCredit = currentCycleExtraIncome
    .filter(i => i.source !== 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // totalSpent: total de saídas do ciclo do cartão
  const totalSpent = totalExpensesCredit + state.initialBill;

  // availableOverall: renda + receitas extras no cartão − gastos no cartão − meta de economia
  const rawAvailable = state.monthlyIncome + totalExtraIncomeCredit - totalSpent;
  const availableOverall = rawAvailable - state.savingsGoal;

  // Economia Blindada
  const safeSavings = Math.max(0, state.savingsGoal + Math.min(0, availableOverall));
  const isSavingsCorroded = state.savingsGoal > 0 && safeSavings < state.savingsGoal;

  // ----- CÁLCULOS DA CONTA BANCÁRIA -----
  const bankExpensesSum = state.expenses
    .filter(e => e.source === 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const bankIncomesSum = state.extraIncome
    .filter(i => i.source === 'bank')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBankBalance = state.initialBankBalance - bankExpensesSum + bankIncomesSum;

  return {
    monthlyIncome: state.monthlyIncome,
    initialBill: state.initialBill,
    closingDay: state.closingDay,
    savingsGoal: state.savingsGoal,
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
    cycleInfo
  };
}
