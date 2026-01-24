"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react"

interface DashboardStatsProps {
  netWorth: number
  monthIncome: number
  monthExpense: number
  cashFlow: number
  savingsRate: number
}

export function DashboardStats({
  netWorth,
  monthIncome,
  monthExpense,
  cashFlow,
  savingsRate,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Patrimônio Líquido</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
          <p className="text-xs text-muted-foreground">Total de ativos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{formatCurrency(monthIncome)}</div>
          <p className="text-xs text-muted-foreground">Entradas em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(monthExpense)}</div>
          <p className="text-xs text-muted-foreground">Saídas em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${cashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(cashFlow)}
          </div>
          <p className="text-xs text-muted-foreground">
            {savingsRate >= 0 ? `${savingsRate.toFixed(1)}% poupado` : 'Déficit mensal'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
