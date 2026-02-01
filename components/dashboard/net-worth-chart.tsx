"use client"
import React from "react"

interface Transaction {
  date: string
  amount: number
  type: "INCOME" | "EXPENSE"
}

interface NetWorthChartProps {
  transactions?: Transaction[]
  initialBalance: number
}

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

function formatMonth(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
}

function groupByMonth(transactions: Transaction[]) {
  const map = new Map<string, number>()
  transactions.forEach((tx) => {
    const key = formatMonth(new Date(tx.date))
    map.set(key, (map.get(key) || 0) + tx.amount * (tx.type === "EXPENSE" ? -1 : 1))
  })
  return map
}

export function NetWorthChart({ transactions = [], initialBalance }: NetWorthChartProps) {
  // Agrupa por mês e calcula saldo acumulado
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return formatMonth(d)
  })
  const grouped = groupByMonth(transactions)
  let saldo = initialBalance
  const data = months.map((month) => {
    saldo += grouped.get(month) || 0
    return { month, saldo }
  })

  return (
    <Card className="bg-[#18181b] border-2 border-teal-500 rounded-lg shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Evolução Patrimonial</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#fff" />
            <YAxis stroke="#fff" tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #14b8a6",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: number) => [formatCurrency(value as number), "Patrimônio"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={{ fill: "#14b8a6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-right">
          <span className="text-sm text-gray-400">Valor Atual: </span>
          <span className="text-lg font-bold text-teal-500">
            {formatCurrency(data[data.length - 1].value)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
