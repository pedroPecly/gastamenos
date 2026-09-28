export const getCycleId = (date, closingDayStr) => {
  const closingDay = closingDayStr ? parseInt(closingDayStr, 10) : null;
  if (!closingDay || closingDay < 1 || closingDay > 31) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  let month = date.getMonth();
  let year = date.getFullYear();
  if (date.getDate() >= closingDay) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

export const calculateCycleInfoFromId = (cycleId, closingDayStr, todayDate = new Date()) => {
  const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  
  const [yearStr, monthStr] = cycleId.split('-');
  const refYear = parseInt(yearStr, 10);
  const refMonth = parseInt(monthStr, 10) - 1; // 0-indexed

  let start, end;
  const closingDay = closingDayStr ? parseInt(closingDayStr, 10) : null;

  if (!closingDay || closingDay < 1 || closingDay > 31) {
    start = new Date(refYear, refMonth, 1);
    end = new Date(refYear, refMonth + 1, 0);
  } else {
    const getValidDate = (y, m, d) => {
      if (d === 0) {
        return new Date(y, m, 0);
      }
      const lastDayOfMonth = new Date(y, m + 1, 0).getDate();
      return new Date(y, m, Math.min(d, lastDayOfMonth));
    };

    end = getValidDate(refYear, refMonth, closingDay - 1);
    
    let startMonth = refMonth - 1;
    let startYear = refYear;
    if (startMonth < 0) {
      startMonth = 11;
      startYear--;
    }
    const prevEnd = getValidDate(startYear, startMonth, closingDay - 1);
    start = new Date(prevEnd);
    start.setDate(start.getDate() + 1);
  }

  const daysInCycle = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const remainingDays = today > end 
    ? 0 
    : today < start 
      ? daysInCycle 
      : Math.round((end - today) / (1000 * 60 * 60 * 24)) + 1;

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
};

export const toMidnightTime = (isoDate) => {
  const d = new Date(isoDate);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export const calculateWeeklyData = ({
  monthlyIncome,
  initialBill,
  savingsGoal,
  budgetMode = 'equal',
  currentCycleExpenses,
  currentCycleExtraIncome,
  cycleInfo
}) => {
  const weeks = [];
  let currentStart = new Date(cycleInfo.start);
  let weekNum = 1;
  const { end, today, daysInCycle } = cycleInfo;
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
      totalSpent: 0,
      extraIncomeList: [],
      totalExtraIncome: 0
    });

    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
    weekNum++;
  }

  // --- MERGE MINI-WEEKS LOGIC ---
  if (budgetMode === 'equal' && weeks.length > 1) {
    const lastWeek = weeks[weeks.length - 1];
    if (lastWeek.daysInWeek <= 3) {
      const prevWeek = weeks[weeks.length - 2];
      
      prevWeek.endDateStr = lastWeek.endDateStr;
      
      const prevStart = new Date(prevWeek.startDateStr);
      const newEnd = new Date(prevWeek.endDateStr);
      const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
      const fmtStart = formatter.format(prevStart).replace('.', '');
      const fmtEnd = formatter.format(newEnd).replace('.', '');
      
      prevWeek.label = `${fmtStart} a ${fmtEnd}`;
      prevWeek.daysInWeek += lastWeek.daysInWeek;
      
      const startT = prevStart.getTime();
      const endT = newEnd.getTime();
      
      if (todayTime > endT) {
        prevWeek.status = 'passed';
      } else if (todayTime >= startT && todayTime <= endT) {
        prevWeek.status = 'current';
      } else {
        prevWeek.status = 'future';
      }
      
      if (prevWeek.status === 'current') {
        prevWeek.activeDays = Math.round((newEnd - today) / (1000 * 60 * 60 * 24)) + 1;
      } else if (prevWeek.status === 'future') {
        prevWeek.activeDays = prevWeek.daysInWeek;
      } else {
        prevWeek.activeDays = 0;
      }
      
      weeks.pop();
    }
  }
  // ------------------------------

  const findWeek = (isoDate) => {
    const t = toMidnightTime(isoDate);
    return weeks.find(w => {
      const st = new Date(w.startDateStr).getTime();
      const en = new Date(w.endDateStr).getTime();
      return t >= st && t <= en;
    });
  };

  currentCycleExpenses.forEach(expense => {
    const week = findWeek(expense.date);
    if (week) {
      week.expensesList.push(expense);
      if (expense.source !== 'bank') {
        week.totalSpent += expense.amount;
      }
    }
  });

  currentCycleExtraIncome.forEach(income => {
    const week = findWeek(income.date);
    if (week) {
      week.extraIncomeList.push(income);
      if (income.source !== 'bank') {
        week.totalExtraIncome += income.amount;
      }
    }
  });

  const baseAvailable = monthlyIncome - initialBill - savingsGoal;
  
  if (budgetMode === 'daily') {
    const dailyBudgetBase = daysInCycle > 0 ? baseAvailable / daysInCycle : 0;
    weeks.forEach(week => {
      week.budget  = dailyBudgetBase * week.daysInWeek;
      week.balance = week.budget - week.totalSpent + week.totalExtraIncome;
    });
  } else {
    const weeklyBudgetBase = weeks.length > 0 ? baseAvailable / weeks.length : 0;
    weeks.forEach(week => {
      week.budget  = weeklyBudgetBase;
      week.balance = week.budget - week.totalSpent + week.totalExtraIncome;
    });
  }

  const passedNetBalance = weeks
    .filter(w => w.status === 'passed')
    .reduce((acc, w) => acc + w.balance, 0);

  if (Math.abs(passedNetBalance) > 0.001) {
    const activeWeeks = weeks.filter(w => w.status !== 'passed');

    if (budgetMode === 'daily') {
      const activeDaysTotal = activeWeeks.reduce((acc, w) => acc + w.daysInWeek, 0);
      if (activeDaysTotal > 0) {
        const adjustmentPerDay = passedNetBalance / activeDaysTotal;
        activeWeeks.forEach(week => {
          week.budget  = week.budget + adjustmentPerDay * week.daysInWeek;
          week.balance = week.budget - week.totalSpent + week.totalExtraIncome;
        });
      }
    } else {
      if (activeWeeks.length > 0) {
        const adjustmentPerWeek = passedNetBalance / activeWeeks.length;
        activeWeeks.forEach(week => {
          week.budget  = week.budget + adjustmentPerWeek;
          week.balance = week.budget - week.totalSpent + week.totalExtraIncome;
        });
      }
    }
  }

  return weeks;
};
