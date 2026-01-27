import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

interface SummaryCardsProps {
  current: number
  profit: number
  profitPercent: number
  yieldPercent: number
  monthlyIncome: number
}

export function SummaryCards({
  current,
  profit,
  profitPercent,
  yieldPercent,
  monthlyIncome,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Patrimônio em Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {current.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            Soma dos ativos financeiros em carteira
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resultado acumulado do período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${profit >= 0 ? "text-green-700" : "text-red-700"}`}>
            R$ {profit.toLocaleString()} ({profitPercent.toFixed(2)}%)
          </div>
          <div className="text-xs text-muted-foreground">
            Retorno total do capital investido: {yieldPercent.toFixed(2)}%. Avalie o desempenho
            considerando seu perfil e objetivos.
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Renda gerada mensalmente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            R$ {monthlyIncome.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Dividendos, juros e rendimentos recebidos no mês
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
