"use client"

import { useEffect, useState } from "react"
import { DashboardStats } from "@/components/dashboard/stats"
import { DashboardSkeleton } from "@/components/ui/loading-skeletons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import dynamic from "next/dynamic"

// Lazy load dos gráficos para melhorar performance inicial
const NetWorthChart = dynamic(
  () => import("@/components/dashboard/net-worth-chart").then(mod => ({ default: mod.NetWorthChart })),
  { ssr: false }
)

const CashFlowChart = dynamic(
  () => import("@/components/dashboard/cash-flow-chart").then(mod => ({ default: mod.CashFlowChart })),
  { ssr: false }
)

const CategoryChart = dynamic(
  () => import("@/components/dashboard/category-chart").then(mod => ({ default: mod.CategoryChart })),
  { ssr: false }
)

const RecentTransactions = dynamic(
  () => import("@/components/dashboard/recent-transactions").then(mod => ({ default: mod.RecentTransactions })),
  { ssr: false }
)

const InsightCard = dynamic(
  () => import("@/components/dashboard/insight-card").then(mod => ({ default: mod.InsightCard })),
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
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/dashboard")
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
  }, [])

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
            <h3 className="text-lg font-semibold mb-2">
              {error || "Erro ao carregar dados"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Não foi possível carregar as informações do dashboard
            </p>
            <Button onClick={fetchDashboard}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do seu patrimônio e movimentações
        </p>
      </div>

      <DashboardStats
        netWorth={data.metrics.netWorth}
        monthIncome={data.metrics.monthIncome}
        monthExpense={data.metrics.monthExpense}
        cashFlow={data.metrics.cashFlow}
        savingsRate={data.metrics.savingsRate}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <NetWorthChart data={data.monthlyData} />
        <CashFlowChart data={data.monthlyData} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryChart data={data.categories} />
        <InsightCard insights={data.insights} />
      </div>

      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  )
}
