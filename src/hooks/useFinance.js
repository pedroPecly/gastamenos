import { useState, useEffect, useMemo } from 'react';

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
        savingsGoal: parsed.savingsGoal || 0
      };
    }
    return {
      monthlyIncome: 0,
      initialBill: 0,
      closingDay: null,
      savingsGoal: 0,
      expenses: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateMonthlyIncome = (newIncome, newInitialBill = 0, newClosingDay = null, newSavingsGoal = 0) => {
    setState((prevState) => ({
      ...prevState,
      monthlyIncome: newIncome,
      initialBill: newInitialBill,
      closingDay: newClosingDay,
      savingsGoal: newSavingsGoal
    }));
  };

  const addExpense = (expense) => {
    setState((prevState) => ({
      ...prevState,
      expenses: [
        ...prevState.expenses,
        {
          ...expense,
          id: crypto.randomUUID(),
          date: new Date().toISOString()
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

  // ----- MOTOR DO CICLO FINANCEIRO -----
  
  const cycleInfo = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let start, end;
    const closingDay = state.closingDay ? parseInt(state.closingDay, 10) : null;

    if (!closingDay || closingDay < 1 || closingDay > 31) {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else {
      const getValidDate = (y, m, d) => {
        const lastDayOfMonth = new Date(y, m + 1, 0).getDate();
        return new Date(y, m, Math.min(d, lastDayOfMonth));
      };

      let endCycleMonth = today.getMonth();
      let endCycleYear = today.getFullYear();
      
      if (today.getDate() > closingDay) {
        endCycleMonth++;
        if (endCycleMonth > 11) {
          endCycleMonth = 0;
          endCycleYear++;
        }
      }
      
      end = getValidDate(endCycleYear, endCycleMonth, closingDay);
      
      let startCycleMonth = endCycleMonth - 1;
      let startCycleYear = endCycleYear;
      if (startCycleMonth < 0) {
        startCycleMonth = 11;
        startCycleYear--;
      }
      const prevEnd = getValidDate(startCycleYear, startCycleMonth, closingDay);
      start = new Date(prevEnd);
      start.setDate(start.getDate() + 1); 
    }

    const daysInCycle = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    let remainingDays = 0;
    if (today > end) {
       remainingDays = 0; 
    } else if (today < start) {
       remainingDays = daysInCycle; 
    } else {
       remainingDays = Math.round((end - today) / (1000 * 60 * 60 * 24)) + 1;
    }

    const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
    const referenceMonthName = formatter.format(end);
    
    return {
      start,
      end,
      daysInCycle,
      remainingDays,
      referenceMonthName: referenceMonthName.charAt(0).toUpperCase() + referenceMonthName.slice(1),
      referenceYear: end.getFullYear(),
      today
    };
  }, [state.closingDay]);

  const currentCycleExpenses = useMemo(() => {
    return state.expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const expDateMidnight = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
      return expDateMidnight >= cycleInfo.start && expDateMidnight <= cycleInfo.end;
    });
  }, [state.expenses, cycleInfo]);

  // Motor Inteligente com Pagamento Antecipado (Savings)
  const weeklyData = useMemo(() => {
    const weeks = [];
    let currentStart = new Date(cycleInfo.start);
    let weekNum = 1;
    const { end, today } = cycleInfo;
    const todayTime = today.getTime();

    while (currentStart <= end) {
      let currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + 6);
      if (currentEnd > end) {
        currentEnd = new Date(end);
      }

      const daysInWeek = Math.round((currentEnd - currentStart) / (1000 * 60 * 60 * 24)) + 1;
      const startT = currentStart.getTime();
      const endT = currentEnd.getTime();

      let status = 'future';
      if (todayTime > endT) {
        status = 'passed';
      } else if (todayTime >= startT && todayTime <= endT) {
        status = 'current';
      }

      let activeDays = 0;
      if (status === 'current') {
        activeDays = Math.round((currentEnd - today) / (1000 * 60 * 60 * 24)) + 1;
      } else if (status === 'future') {
        activeDays = daysInWeek;
      }

      const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
      const fmtStart = formatter.format(currentStart).replace('.', '');
      const fmtEnd = formatter.format(currentEnd).replace('.', '');

      weeks.push({
        weekNumber: weekNum,
        startDateStr: currentStart.toISOString(),
        endDateStr: currentEnd.toISOString(),
        label: `${fmtStart} a ${fmtEnd}`,
        daysInWeek,
        status,
        activeDays,
        budget: 0,
        balance: 0,
        expensesList: [],
        totalSpent: 0
      });

      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() + 1);
      weekNum++;
    }

    currentCycleExpenses.forEach(expense => {
      const expDate = new Date(expense.date);
      const expTime = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate()).getTime();
      
      const week = weeks.find(w => {
         const st = new Date(w.startDateStr).getTime();
         const en = new Date(w.endDateStr).getTime();
         return expTime >= st && expTime <= en;
      });

      if (week) {
        week.expensesList.push(expense);
        week.totalSpent += expense.amount;
      }
    });

    const allAppExpensesSum = currentCycleExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    // Dinheiro disponível desconta a Fatura e a Meta de Economia
    const availableMoney = state.monthlyIncome - state.initialBill - state.savingsGoal - allAppExpensesSum;
    
    const dailyBudget = availableMoney > 0 && cycleInfo.remainingDays > 0 
      ? availableMoney / cycleInfo.remainingDays 
      : 0;

    weeks.forEach(week => {
      if (week.status === 'passed') {
        week.budget = week.totalSpent;
        week.balance = 0;
      } else {
        const weekRemainingBalance = week.activeDays * dailyBudget;
        week.budget = weekRemainingBalance + week.totalSpent;
        week.balance = weekRemainingBalance;
      }
    });

    return weeks;
  }, [state.monthlyIncome, state.initialBill, state.savingsGoal, currentCycleExpenses, cycleInfo]);

  // Cálculos Gerais
  const totalSpent = currentCycleExpenses.reduce((acc, curr) => acc + curr.amount, 0) + state.initialBill;
  const rawAvailable = state.monthlyIncome - totalSpent;
  const availableOverall = rawAvailable - state.savingsGoal;
  
  // Se availableOverall for negativo, significa que começou a comer a economia.
  const safeSavings = Math.max(0, state.savingsGoal + Math.min(0, availableOverall));
  const isSavingsCorroded = state.savingsGoal > 0 && safeSavings < state.savingsGoal;

  return {
    monthlyIncome: state.monthlyIncome,
    initialBill: state.initialBill,
    closingDay: state.closingDay,
    savingsGoal: state.savingsGoal,
    availableOverall, // Dinheiro livre (sem a economia)
    safeSavings, // Dinheiro blindado que sobrou
    isSavingsCorroded,
    totalSpent,
    expenses: currentCycleExpenses,
    updateMonthlyIncome,
    addExpense,
    deleteExpense,
    weeklyData,
    cycleInfo
  };
}
