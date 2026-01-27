"use client"

import { useEffect, useState } from "react"
import DashboardStats from "@/components/dashboard/stats"
import { GoalsProgress } from "@/components/dashboard/goals-progress"
import { GoalsStatusBlock } from "@/components/dashboard/goals-status-block"
import { FinancialSimulationBlock } from "@/components/dashboard/financial-simulation-block"
import { TooltipProgressiva } from "@/components/tooltip-progressiva"
import { CategoryBudgetBlock } from "@/components/dashboard/category-budget-block"

import { ResultBarChart } from "@/components/dashboard/result-bar-chart"
import { MonthSelector } from "@/components/dashboard/month-selector"
import { DashboardSkeleton } from "@/components/ui/loading-skeletons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import dynamic from "next/dynamic"
// OnboardingTour is dynamically imported to avoid SSR issues
const OnboardingTour = dynamic(() => import("@/components/onboarding-tour"), { ssr: false })

// Lazy load dos gráficos para melhorar performance inicial
const NetWorthChart = dynamic(
  () =>
    import("@/components/dashboard/net-worth-chart").then((mod) => ({
      default: mod.NetWorthChart,
    })),
  { ssr: false }
)

const CategoryChart = dynamic(
  () =>
    import("@/components/dashboard/category-chart").then((mod) => ({ default: mod.CategoryChart })),
  { ssr: false }
)

const RecentTransactions = dynamic(
  () =>
    import("@/components/dashboard/recent-transactions").then((mod) => ({
      default: mod.RecentTransactions,
    })),
  { ssr: false }
)

const InsightCard = dynamic(
  () => import("@/components/dashboard/insight-card").then((mod) => ({ default: mod.InsightCard })),
  { ssr: false }
)

interface DashboardData {
  metrics: {
    netWorth: number
    monthIncome: number
    monthExpense: number
    cashFlow: number
    savingsRate: number
  }
  categories: Array<{
    category: string
    total: number
    percentage: number
    count: number
  }>
  monthlyData: Array<{
    month: string
    income: number
    expense: number
    netWorth: number
  }>
  recentTransactions: Array<{
    id: string
    type: string
    category: string
    amount: string
    description: string
    date: string
    account: { name: string; institution: string } | null
    card: { name: string; brand: string } | null
  }>
  insights: string[]
}

export default function DashboardPage() {
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Onboarding effect: show only if not completed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("onboarding_completed")
      if (!completed) {
        setShowOnboarding(true)
      }
    }
  }, [])

  // Handler to close onboarding and persist completion
  const handleCloseOnboarding = () => {
    setShowOnboarding(false)
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "1")
    }
  }
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [isYearView, setIsYearView] = useState(false)

  const fetchDashboard = async () => {
    try {
      const params = new URLSearchParams()
      params.set("month", selectedMonth)
      params.set("yearView", isYearView ? "1" : "0")
      const response = await fetch(`/api/dashboard?${params.toString()}`)
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
        setError(null)
      } else {
        setError("Erro ao carregar dados")
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err)
      setError("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 60000)
    return () => clearInterval(interval)
  }, [selectedMonth, isYearView])

  useEffect(() => {
    const handleUpdate = () => fetchDashboard()
    window.addEventListener("transaction-updated", handleUpdate)
    return () => window.removeEventListener("transaction-updated", handleUpdate)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{error || "Erro ao carregar dados"}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Não foi possível carregar as informações do dashboard
            </p>
            <Button onClick={fetchDashboard}>Tentar Novamente</Button>
          </CardContent>
        </Card>
        {showOnboarding && <OnboardingTour onClose={handleCloseOnboarding} />}
      </div>
    )
  }

  // Helpers para navegação de mês/ano
  const getMonthName = (ym: string): string => {
    if (isYearView) return ym.split("-")[0] || ""
    const [year, month] = ym.split("-")
    if (!month) return year || ""
    return `${month.padStart(2, "0")}/${year}`
  }
  const handlePrev = () => {
    if (isYearView) {
      const year = Number(selectedMonth.split("-")[0]) - 1
      setSelectedMonth(`${year}-01`)
    } else {
      const [yearStr, monthStr] = selectedMonth.split("-")
      const year = Number(yearStr)
      const month = Number(monthStr)
      if (!isNaN(year) && !isNaN(month)) {
        const prev = new Date(year, month - 2, 1)
        setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`)
      }
    }
  }
  const handleNext = () => {
    if (isYearView) {
      const year = Number(selectedMonth.split("-")[0]) + 1
      setSelectedMonth(`${year}-01`)
    } else {
      const [yearStr, monthStr] = selectedMonth.split("-")
      const year = Number(yearStr)
      const month = Number(monthStr)
      if (!isNaN(year) && !isNaN(month)) {
        const next = new Date(year, month, 1)
        setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`)
      }
    }
  }
  const handleYearView = () => setIsYearView((v) => !v)

  return (
    <div className="space-y-6">
      {showOnboarding && <OnboardingTour onClose={handleCloseOnboarding} />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <TooltipProgressiva
            id="dashboard"
            text="Aqui você acompanha saldo, evolução e movimentos. Use os gráficos para identificar tendências."
            cta="Entendi"
          >
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </TooltipProgressiva>
          <p className="text-muted-foreground">Visão geral do seu patrimônio e movimentações</p>
        </div>
        <MonthSelector
          month={getMonthName(selectedMonth)}
          onPrev={handlePrev}
          onNext={handleNext}
          onYearView={handleYearView}
          isYearView={isYearView}
        />
      </div>

      {/* Cards de topo: Central de decisão financeira */}
      <DashboardStats
        netWorth={data.metrics.netWorth}
        monthIncome={data.metrics.monthIncome}
        monthExpense={data.metrics.monthExpense}
        cashFlow={data.metrics.cashFlow}
        goalValue={data.goals?.[0]?.targetAmount ? Number(data.goals[0].targetAmount) : undefined}
        projectionValue={data.metrics.netWorth + data.metrics.savingsRate * 12}
        progressPercent={data.goals?.[0]?.progress}
        status={
          data.goals?.[0]?.status === "ACTIVE"
            ? "ok"
            : data.goals?.[0]?.status === "PAUSED"
              ? "risco"
              : "atrasado"
        }
      />

      {/* Bloco de Simulação Financeira */}
      <FinancialSimulationBlock onSimulate={() => {}} />

      {/* Gráfico de evolução patrimonial com três linhas (real, conservadora, otimista) */}
      <div className="grid gap-6 md:grid-cols-2">
        <NetWorthChart data={data.monthlyData} />
        <ResultBarChart
          data={data.monthlyData.map((item) => ({
            month: item.month,
            income: item.income,
            expense: item.expense,
            result: item.income - Math.abs(item.expense),
            transactions: data.recentTransactions
              .filter((t) => t.date.startsWith(item.month))
              .map((t) => ({
                id: t.id,
                amount: Number(t.amount),
                description: t.description,
                date: t.date,
                category: t.category,
              })),
          }))}
        />
      </div>

      {/* Metas ativas integradas ao dashboard */}
      <GoalsProgress goals={data.goals || []} />
      <GoalsStatusBlock goals={data.goals || []} />

      {/* Orçamento por categoria */}
      <CategoryBudgetBlock
        categories={data.categories.map((cat) => ({
          category: cat.category,
          budget: cat.budget ?? 0,
          spent: cat.total ?? 0,
        }))}
      />

      {/* Insights acionáveis */}
      <div className="grid gap-6 md:grid-cols-2">
        <CategoryChart data={data.categories} />
        <InsightCard insights={data.insights} />
      </div>

      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  )
}
