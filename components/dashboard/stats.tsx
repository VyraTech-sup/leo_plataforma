"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// TrendingFlat não existe no lucide-react, usar TrendingUp para status "risco" ou ajustar conforme necessário

interface DashboardStatsProps {
  netWorth: number
  monthIncome: number
  monthExpense: number
  cashFlow: number
  goalValue?: number // Meta definida
  projectionValue?: number // Projeção automática
  progressPercent?: number // Progresso em relação à meta
  status?: "ok" | "risco" | "atrasado" // Status visual
}

const DashboardStats = ({
  netWorth,
  monthIncome,
  monthExpense,
  cashFlow,
  goalValue,
  projectionValue,
  progressPercent,
  status,
}: DashboardStatsProps) => {
  const router = useRouter()
  // Status visual
  const statusMap = {
    ok: {
      label: "No ritmo",
      color: "bg-green-500",
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
    },
    risco: {
      label: "Risco",
      color: "bg-yellow-500",
      icon: <TrendingUp className="h-4 w-4 text-yellow-500" />,
    }, // Ajuste: TrendingFlat não existe
    atrasado: {
      label: "Atrasado",
      color: "bg-red-500",
      icon: <TrendingDown className="h-4 w-4 text-red-500" />,
    },
  }
  const statStatus = status ? statusMap[status] : statusMap["ok"]
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card principal: Central de decisão */}
      <Card className="col-span-2 lg:col-span-2 ring-2 ring-primary/30 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Central Financeira
            <span
              title="Visão integrada: valor atual, meta, projeção e status"
              className="cursor-help text-muted-foreground"
            >
              &#9432;
            </span>
          </CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Valor Atual</div>
                <div className="text-xl font-bold">{formatCurrency(netWorth)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Meta</div>
                <div className="text-xl font-bold">
                  {goalValue !== undefined ? formatCurrency(goalValue) : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Projeção</div>
                <div className="text-xl font-bold">
                  {projectionValue !== undefined ? formatCurrency(projectionValue) : "-"}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${statStatus.color} text-white flex items-center gap-1`}
                >
                  {statStatus.icon} {statStatus.label}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={progressPercent ?? 0} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                Progresso: {progressPercent !== undefined ? progressPercent.toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        onClick={() => router.push("/dashboard/accounts")}
        className="cursor-pointer hover:ring-2 ring-primary"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{formatCurrency(monthIncome)}</div>
          <p className="text-xs text-muted-foreground">
            Entradas em {new Date().toLocaleDateString("pt-BR", { month: "long" })}
          </p>
        </CardContent>
      </Card>
      <Card
        onClick={() => router.push("/dashboard/transactions?type=expense")}
        className="cursor-pointer hover:ring-2 ring-primary"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(monthExpense)}</div>
          <p className="text-xs text-muted-foreground">
            Saídas em {new Date().toLocaleDateString("pt-BR", { month: "long" })}
          </p>
        </CardContent>
      </Card>
      <Card
        onClick={() => router.push("/dashboard/transactions")}
        className="cursor-pointer hover:ring-2 ring-primary"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resultado do Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${cashFlow >= 0 ? "text-success" : "text-destructive"}`}
          >
            {formatCurrency(cashFlow)}
          </div>
          <p className="text-xs text-muted-foreground">
            Este é o seu resultado financeiro do mês: Receitas menos Despesas. Acompanhe este valor
            para entender se está avançando ou se ajustes são necessários.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardStats
