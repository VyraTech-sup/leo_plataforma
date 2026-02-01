import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DashboardStats } from "@/components/dashboard/stats"
import { NetWorthChart } from "@/components/dashboard/net-worth-chart"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { GoalsProgress } from "@/components/dashboard/goals-progress"
import { InsightCard } from "@/components/dashboard/insight-card"
import { ProjectionsCard } from "@/components/dashboard/projections-card"
import { GoalsTracking } from "@/components/dashboard/goals-tracking"
import { CardsSummary } from "@/components/dashboard/cards-summary"
import { InvestmentsSummary } from "@/components/dashboard/investments-summary"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  // Buscar dados do banco
  const [accounts, transactions, goals, investments, cards] = await Promise.all([
    prisma.account.findMany({ where: { userId, isActive: true } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 10,
      include: { account: true, card: true },
    }),
    prisma.goal.findMany({ where: { userId, isCompleted: false } }),
    prisma.investment.findMany({ where: { userId } }),
    prisma.card.findMany({ where: { userId, isActive: true } }),
  ])

  // Calcular métricas
  const totalAccounts = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
  const totalInvestments = investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0)
  const netWorth = totalAccounts + totalInvestments

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const monthIncome = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const monthExpense = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const cashFlow = monthIncome - monthExpense

  // Buscar transações dos últimos 6 meses para evolução
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const historicalTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: sixMonthsAgo },
    },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Olá, João!</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-black border border-teal-500 rounded-lg">
          <span className="text-white">02/2026</span>
          <span className="text-gray-400">📅</span>
        </div>
      </div>

      {/* Row 1: 4 Stats Cards */}
      <DashboardStats
        netWorth={netWorth}
        monthIncome={monthIncome}
        monthExpense={monthExpense}
        cashFlow={cashFlow}
      />

      {/* Row 2: Evolução Patrimonial + Fluxo de Caixa */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NetWorthChart transactions={historicalTransactions} initialBalance={totalAccounts} />
        <CashFlowChart transactions={monthTransactions} />
      </div>

      {/* Row 3: Gastos por Categoria + Progresso de Metas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryChart transactions={monthTransactions} />
        <GoalsProgress goals={goals} />
      </div>

      {/* Row 4: Transações Recentes (Full Width) */}
      <RecentTransactions transactions={transactions} />

      {/* Row 5: Projeções + Acompanhamento de Metas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectionsCard />
        <GoalsTracking goals={goals} />
      </div>

      {/* Row 6: Cartões + Investimentos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardsSummary cards={cards} />
        <InvestmentsSummary investments={investments} />
      </div>

      {/* Row 7: Insights (Full Width) */}
      <InsightCard
        netWorth={netWorth}
        cashFlow={cashFlow}
        monthExpense={monthExpense}
        monthIncome={monthIncome}
      />
    </div>
  )
}
