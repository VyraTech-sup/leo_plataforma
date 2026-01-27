"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { NetWorthDetailModal } from "@/components/dashboard/net-worth-detail-modal"

interface NetWorthChartProps {
  data: Array<{
    month: string
    netWorth: number
    variation?: number
    aportes?: number
    resgates?: number
    rendimentos?: number
  }>
}

export function NetWorthChart({ data }: NetWorthChartProps) {
  const [detail, setDetail] = useState<null | {
    month: string
    netWorth: number
    variation: number
    aportes: number
    resgates: number
    rendimentos: number
  }>(null)

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Patrimonial</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    month: item.month,
    valor: item.netWorth,
    variation: item.variation ?? 0,
    aportes: item.aportes ?? 0,
    resgates: item.resgates ?? 0,
    rendimentos: item.rendimentos ?? 0,
  }))

  const handleDotClick = (e: any) => {
    if (!e || !e.activePayload || !e.activePayload[0]) return
    const d = e.activePayload[0].payload
    setDetail({
      month: d.month,
      netWorth: d.valor,
      variation: d.variation,
      aportes: d.aportes,
      resgates: d.resgates,
      rendimentos: d.rendimentos,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Patrimonial</CardTitle>
        <CardDescription>Crescimento do patrimônio nos últimos meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} onClick={handleDotClick}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" stroke="currentColor" />
            <YAxis
              className="text-xs"
              stroke="currentColor"
              tickFormatter={(value: number) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [formatCurrency(value), "Patrimônio"]}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {detail && (
          <NetWorthDetailModal
            month={detail.month}
            netWorth={detail.netWorth}
            variation={detail.variation}
            aportes={detail.aportes}
            resgates={detail.resgates}
            rendimentos={detail.rendimentos}
            onClose={() => setDetail(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}
