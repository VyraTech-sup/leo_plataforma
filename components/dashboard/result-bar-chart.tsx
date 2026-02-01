import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface ResultBarChartProps {
  data: Array<{
    month: string
    income: number
    expense: number
    result: number
    transactions?: Array<{
      id: string
      amount: number
      description: string
      date: string
      category: string
    }>
  }>
}

export function ResultBarChart({ data }: ResultBarChartProps) {
  const [selected, setSelected] = useState<null | { month: string; transactions: any[] }>(null)

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Resultados do Período</CardTitle>
          <CardDescription>
            Acompanhe o saldo entre receitas e despesas para decisões mais assertivas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhum dado disponível para este período.
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    name: item.month,
    Receitas: item.income,
    Despesas: Math.abs(item.expense),
    Resultado: item.result,
    transactions: item.transactions || [],
  }))

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      setSelected({
        month: data.activePayload[0].payload.name,
        transactions: data.activePayload[0].payload.transactions,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Resultados do Período</CardTitle>
        <CardDescription>
          Acompanhe o saldo entre receitas e despesas para decisões mais assertivas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" stroke="currentColor" />
            <YAxis className="text-xs" stroke="currentColor" tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="Receitas" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesas" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Resultado" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {selected && (
          <div className="mt-4 bg-muted rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Transações de {selected.month}</span>
              <button
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => setSelected(null)}
              >
                Fechar
              </button>
            </div>
            <ul className="max-h-48 overflow-y-auto text-xs">
              {selected.transactions.length === 0 && (
                <li className="text-muted-foreground">Nenhuma transação encontrada.</li>
              )}
              {selected.transactions.map((t) => (
                <li key={t.id} className="py-1 border-b last:border-b-0 flex justify-between">
                  <span>
                    {t.date} - {t.description} ({t.category})
                  </span>
                  <span>{formatCurrency(t.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
