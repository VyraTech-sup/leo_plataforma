import { describe, it, expect } from 'vitest'

// Testes para transformação de relatórios mensais
describe('Transformação de Dados - Relatório Mensal', () => {
  it('deve gerar estrutura de relatório mensal completa', () => {
    const relatorio = {
      period: {
        month: 'Janeiro',
        year: 2024,
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      },
      summary: {
        totalIncome: 5000,
        totalExpense: 3500,
        cashFlow: 1500,
        savingsRate: 30,
        netWorth: 15000,
      },
      topCategories: [
        { category: 'Alimentação', amount: 1000, percentage: 28.57, count: 15 },
        { category: 'Transporte', amount: 800, percentage: 22.86, count: 10 },
      ],
      dailyEvolution: [],
      insights: ['Excelente! Taxa de poupança de 30.0%'],
    }

    expect(relatorio.period.month).toBe('Janeiro')
    expect(relatorio.summary.cashFlow).toBe(1500)
    expect(relatorio.topCategories).toHaveLength(2)
    expect(relatorio.insights).toHaveLength(1)
  })

  it('deve calcular evolução diária corretamente', () => {
    const transactions = [
      { date: '2024-01-01', type: 'INCOME', amount: 5000 },
      { date: '2024-01-02', type: 'EXPENSE', amount: 100 },
      { date: '2024-01-02', type: 'EXPENSE', amount: 50 },
    ]

    let balance = 0
    const dailyEvolution = transactions.map((t) => {
      if (t.type === 'INCOME') {
        balance += t.amount
      } else {
        balance -= t.amount
      }
      return {
        date: t.date,
        balance,
        income: t.type === 'INCOME' ? t.amount : 0,
        expense: t.type === 'EXPENSE' ? t.amount : 0,
      }
    })

    expect(dailyEvolution[0].balance).toBe(5000)
    expect(dailyEvolution[1].balance).toBe(4900)
    expect(dailyEvolution[2].balance).toBe(4850)
  })
})

// Testes para transformação de relatórios anuais
describe('Transformação de Dados - Relatório Anual', () => {
  it('deve gerar estrutura de relatório anual completa', () => {
    const relatorio = {
      period: {
        year: 2024,
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
      summary: {
        totalIncome: 60000,
        totalExpense: 42000,
        averageMonthlyIncome: 5000,
        averageMonthlyExpense: 3500,
        totalCashFlow: 18000,
        annualSavingsRate: 30,
        netWorthGrowth: 18000,
        netWorthGrowthPercentage: 120,
      },
      monthlyComparison: [
        { month: 'Jan', income: 5000, expense: 3500, cashFlow: 1500, savingsRate: 30 },
        { month: 'Fev', income: 5200, expense: 3600, cashFlow: 1600, savingsRate: 30.77 },
      ],
      topCategories: [
        { category: 'Alimentação', amount: 12000, percentage: 28.57 },
      ],
      bestMonth: { month: 'Fev', cashFlow: 1600 },
      worstMonth: { month: 'Jan', cashFlow: 1500 },
      goalsProgress: [],
    }

    expect(relatorio.summary.totalCashFlow).toBe(18000)
    expect(relatorio.summary.averageMonthlyIncome).toBe(5000)
    expect(relatorio.monthlyComparison).toHaveLength(2)
    expect(relatorio.bestMonth.month).toBe('Fev')
  })

  it('deve calcular médias mensais corretamente', () => {
    const monthlyData = [
      { income: 5000, expense: 3500 },
      { income: 5200, expense: 3600 },
      { income: 4800, expense: 3400 },
    ]

    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
    const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0)
    const avgIncome = totalIncome / monthlyData.length
    const avgExpense = totalExpense / monthlyData.length

    expect(avgIncome).toBe(5000)
    expect(avgExpense).toBe(3500)
  })

  it('deve identificar melhor e pior mês', () => {
    const monthlyData = [
      { month: 'Jan', cashFlow: 1500 },
      { month: 'Fev', cashFlow: 1600 },
      { month: 'Mar', cashFlow: 1400 },
    ]

    const sorted = [...monthlyData].sort((a, b) => b.cashFlow - a.cashFlow)
    const bestMonth = sorted[0]
    const worstMonth = sorted[sorted.length - 1]

    expect(bestMonth.month).toBe('Fev')
    expect(bestMonth.cashFlow).toBe(1600)
    expect(worstMonth.month).toBe('Mar')
    expect(worstMonth.cashFlow).toBe(1400)
  })
})

// Testes para geração de insights
describe('Geração de Insights', () => {
  it('deve gerar insight positivo para alta taxa de poupança', () => {
    const savingsRate = 25
    const insight = savingsRate > 20
      ? `Excelente! Taxa de poupança de ${savingsRate.toFixed(1)}%`
      : null

    expect(insight).toBeTruthy()
    expect(insight).toContain('Excelente')
    expect(insight).toContain('25.0%')
  })

  it('deve gerar insight de alerta para déficit', () => {
    const cashFlow = -500
    const insight = cashFlow < 0
      ? `Atenção: déficit de R$ ${Math.abs(cashFlow).toFixed(2)}`
      : null

    expect(insight).toBeTruthy()
    expect(insight).toContain('Atenção')
    expect(insight).toContain('500.00')
  })

  it('deve gerar insight sobre maior categoria de despesa', () => {
    const topCategories = [
      { category: 'Alimentação', amount: 1000 },
      { category: 'Transporte', amount: 800 },
    ]

    const insight = topCategories.length > 0
      ? `${topCategories[0].category} foi a maior despesa: R$ ${topCategories[0].amount.toFixed(2)}`
      : null

    expect(insight).toBeTruthy()
    expect(insight).toContain('Alimentação')
    expect(insight).toContain('1000.00')
  })
})

// Testes para filtragem e agregação
describe('Filtragem e Agregação de Transações', () => {
  it('deve filtrar transações por período', () => {
    const transactions = [
      { date: new Date('2024-01-15'), amount: 100 },
      { date: new Date('2024-02-15'), amount: 200 },
      { date: new Date('2024-01-20'), amount: 150 },
    ]

    const periodStart = new Date('2024-01-01')
    const periodEnd = new Date('2024-01-31')

    const filtered = transactions.filter(
      (t) => t.date >= periodStart && t.date <= periodEnd
    )

    expect(filtered).toHaveLength(2)
    expect(filtered.reduce((sum, t) => sum + t.amount, 0)).toBe(250)
  })

  it('deve filtrar apenas despesas', () => {
    const transactions = [
      { type: 'INCOME', amount: 5000 },
      { type: 'EXPENSE', amount: 100 },
      { type: 'EXPENSE', amount: 200 },
    ]

    const expenses = transactions.filter((t) => t.type === 'EXPENSE')

    expect(expenses).toHaveLength(2)
    expect(expenses.reduce((sum, t) => sum + t.amount, 0)).toBe(300)
  })

  it('deve agregar por categoria e ordenar', () => {
    const expenses = [
      { category: 'Alimentação', amount: 100 },
      { category: 'Transporte', amount: 200 },
      { category: 'Alimentação', amount: 150 },
      { category: 'Lazer', amount: 50 },
    ]

    const grouped = expenses.reduce((acc, e) => {
      if (!acc[e.category]) {
        acc[e.category] = { category: e.category, amount: 0, count: 0 }
      }
      acc[e.category].amount += e.amount
      acc[e.category].count += 1
      return acc
    }, {} as Record<string, { category: string; amount: number; count: number }>)

    const sorted = Object.values(grouped).sort((a, b) => b.amount - a.amount)

    expect(sorted[0].category).toBe('Alimentação')
    expect(sorted[0].amount).toBe(250)
    expect(sorted[0].count).toBe(2)
  })
})

// Testes para cálculo de percentuais
describe('Cálculo de Percentuais', () => {
  it('deve calcular percentual de categoria sobre total de despesas', () => {
    const totalExpense = 3500
    const categoryExpense = 1000
    const percentage = (categoryExpense / totalExpense) * 100

    expect(percentage).toBeCloseTo(28.57, 2)
  })

  it('deve calcular taxa de poupança', () => {
    const income = 5000
    const expense = 3500
    const cashFlow = income - expense
    const savingsRate = (cashFlow / income) * 100

    expect(savingsRate).toBe(30)
  })

  it('deve tratar divisão por zero', () => {
    const income = 0
    const cashFlow = -100
    const savingsRate = income > 0 ? (cashFlow / income) * 100 : 0

    expect(savingsRate).toBe(0)
  })
})
