import { prisma } from "@/lib/db"
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"

// Interface para relatório mensal
export interface MonthlyReport {
  period: {
    month: string
    year: number
    start: Date
    end: Date
  }
  summary: {
    totalIncome: number
    totalExpense: number
    cashFlow: number
    savingsRate: number
    netWorth: number
  }
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
    count: number
  }>
  dailyEvolution: Array<{
    date: string
    balance: number
    income: number
    expense: number
  }>
  insights: string[]
}

// Interface para relatório anual
export interface AnnualReport {
  period: {
    year: number
    start: Date
    end: Date
  }
  summary: {
    totalIncome: number
    totalExpense: number
    averageMonthlyIncome: number
    averageMonthlyExpense: number
    totalCashFlow: number
    annualSavingsRate: number
    netWorthGrowth: number
    netWorthGrowthPercentage: number
  }
  monthlyComparison: Array<{
    month: string
    income: number
    expense: number
    cashFlow: number
    savingsRate: number
  }>
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
  bestMonth: {
    month: string
    cashFlow: number
  }
  worstMonth: {
    month: string
    cashFlow: number
  }
  goalsProgress: Array<{
    name: string
    targetAmount: number
    currentAmount: number
    progress: number
    status: string
  }>
}

export async function generateMonthlyReport(
  userId: string,
  month: number,
  year: number
): Promise<MonthlyReport> {
  const periodStart = startOfMonth(new Date(year, month - 1))
  const periodEnd = endOfMonth(new Date(year, month - 1))

  const [transactions, accounts, previousBalance] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      orderBy: { date: "asc" },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { balance: true },
    }),
    // Saldo até o mês anterior para calcular evolução
    prisma.transaction.findMany({
      where: {
        userId,
        date: { lt: periodStart },
      },
      select: { type: true, amount: true },
    }),
  ])

  // Cálculos do resumo
  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const cashFlow = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? (cashFlow / totalIncome) * 100 : 0
  const netWorth = accounts.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0)

  // Top categorias
  const categoryMap = new Map<string, { amount: number; count: number }>()
  transactions
    .filter((t: any) => t.type === "EXPENSE")
    .forEach((t: any) => {
      const current = categoryMap.get(t.category) || { amount: 0, count: 0 }
      categoryMap.set(t.category, {
        amount: current.amount + Number(t.amount),
        count: current.count + 1,
      })
    })

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Evolução diária
  const dailyMap = new Map<string, { income: number; expense: number }>()
  transactions.forEach((t: any) => {
    const day = t.date.toISOString().split("T")[0]
    const current = dailyMap.get(day) || { income: 0, expense: 0 }
    if (t.type === "INCOME") {
      current.income += Number(t.amount)
    } else if (t.type === "EXPENSE") {
      current.expense += Number(t.amount)
    }
    dailyMap.set(day, current)
  })

  let runningBalance =
    previousBalance.reduce((sum: number, t: any) => {
      return sum + (t.type === "INCOME" ? Number(t.amount) : -Number(t.amount))
    }, 0)

  const dailyEvolution = Array.from(dailyMap.entries())
    .map(([date, data]) => {
      runningBalance += data.income - data.expense
      return {
        date,
        balance: runningBalance,
        income: data.income,
        expense: data.expense,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  // Insights simples
  const insights: string[] = []
  if (savingsRate > 20) {
    insights.push(`Excelente! Taxa de poupança de ${savingsRate.toFixed(1)}%`)
  } else if (savingsRate < 0) {
    insights.push(`Atenção: déficit de R$ ${Math.abs(cashFlow).toFixed(2)}`)
  }
  if (topCategories.length > 0 && topCategories[0]) {
    insights.push(
      `${topCategories[0].category} foi a maior despesa: R$ ${topCategories[0].amount.toFixed(2)}`
    )
  }

  return {
    period: {
      month: new Date(year, month - 1).toLocaleDateString("pt-BR", { month: "long" }),
      year,
      start: periodStart,
      end: periodEnd,
    },
    summary: {
      totalIncome,
      totalExpense,
      cashFlow,
      savingsRate,
      netWorth,
    },
    topCategories,
    dailyEvolution,
    insights,
  }
}

export async function generateAnnualReport(
  userId: string,
  year: number
): Promise<AnnualReport> {
  const periodStart = startOfYear(new Date(year, 0))
  const periodEnd = endOfYear(new Date(year, 0))

  const [transactions, goals, startBalance, endBalance] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      orderBy: { date: "asc" },
    }),
    prisma.goal.findMany({
      where: { userId },
      include: {
        contributions: {
          where: {
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        },
      },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { balance: true, createdAt: true },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { balance: true },
    }),
  ])

  // Cálculos anuais
  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

  const totalCashFlow = totalIncome - totalExpense
  const annualSavingsRate = totalIncome > 0 ? (totalCashFlow / totalIncome) * 100 : 0

  const netWorthEnd = endBalance.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0)
  const netWorthStart = startBalance
    .filter((acc: any) => acc.createdAt < periodStart)
    .reduce((sum: number, acc: any) => sum + Number(acc.balance), 0)

  const netWorthGrowth = netWorthEnd - netWorthStart
  const netWorthGrowthPercentage =
    netWorthStart > 0 ? (netWorthGrowth / netWorthStart) * 100 : 0

  // Comparação mensal
  const monthlyMap = new Map<number, { income: number; expense: number }>()
  transactions.forEach((t: any) => {
    const month = t.date.getMonth()
    const current = monthlyMap.get(month) || { income: 0, expense: 0 }
    if (t.type === "INCOME") {
      current.income += Number(t.amount)
    } else if (t.type === "EXPENSE") {
      current.expense += Number(t.amount)
    }
    monthlyMap.set(month, current)
  })

  const monthlyComparison = Array.from({ length: 12 }, (_, i) => {
    const data = monthlyMap.get(i) || { income: 0, expense: 0 }
    const cashFlow = data.income - data.expense
    const savingsRate = data.income > 0 ? (cashFlow / data.income) * 100 : 0
    return {
      month: new Date(year, i).toLocaleDateString("pt-BR", { month: "short" }),
      income: data.income,
      expense: data.expense,
      cashFlow,
      savingsRate,
    }
  })

  // Top categorias do ano
  const categoryMap = new Map<string, number>()
  transactions
    .filter((t: any) => t.type === "EXPENSE")
    .forEach((t: any) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Number(t.amount))
    })

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Melhor e pior mês
  const monthsWithCashFlow = monthlyComparison.filter((m) => m.income > 0 || m.expense > 0)
  const bestMonth =
    monthsWithCashFlow.length > 0
      ? monthsWithCashFlow.reduce((best, current) =>
          current.cashFlow > best.cashFlow ? current : best
        )
      : { month: "-", cashFlow: 0 }

  const worstMonth =
    monthsWithCashFlow.length > 0
      ? monthsWithCashFlow.reduce((worst, current) =>
          current.cashFlow < worst.cashFlow ? current : worst
        )
      : { month: "-", cashFlow: 0 }

  // Progresso de metas
  const goalsProgress = goals.map((goal: any) => ({
    name: goal.name,
    targetAmount: Number(goal.targetAmount),
    currentAmount: Number(goal.currentAmount),
    progress:
      Number(goal.targetAmount) > 0
        ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
        : 0,
    status: goal.status,
  }))

  return {
    period: {
      year,
      start: periodStart,
      end: periodEnd,
    },
    summary: {
      totalIncome,
      totalExpense,
      averageMonthlyIncome: totalIncome / 12,
      averageMonthlyExpense: totalExpense / 12,
      totalCashFlow,
      annualSavingsRate,
      netWorthGrowth,
      netWorthGrowthPercentage,
    },
    monthlyComparison,
    topCategories,
    bestMonth: {
      month: bestMonth.month,
      cashFlow: bestMonth.cashFlow,
    },
    worstMonth: {
      month: worstMonth.month,
      cashFlow: worstMonth.cashFlow,
    },
    goalsProgress,
  }
}
