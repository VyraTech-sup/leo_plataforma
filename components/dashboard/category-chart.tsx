"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface CategoryChartProps {
  data: Array<{
    category: string
    total: number
    percentage: number
    count: number
  }>
}

const COLORS = [
  "hsl(var(--success))", // Verde institucional
  "hsl(var(--warning))", // Amarelo institucional
  "hsl(var(--destructive))", // Vermelho institucional
  "hsl(var(--secondary))", // Roxo institucional
  "hsl(var(--info))", // Azul institucional
  "hsl(var(--muted))", // Cinza institucional
]

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
          <CardDescription>
            Visualize onde estão concentrados seus principais gastos e identifique oportunidades de
            ajuste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhuma despesa registrada neste mês.
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.slice(0, 6).map((item) => ({
    name: item.category,
    value: Math.abs(item.total),
  }))

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
        <CardDescription>
          Visualize onde estão concentrados seus principais gastos e identifique oportunidades de
          ajuste.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
