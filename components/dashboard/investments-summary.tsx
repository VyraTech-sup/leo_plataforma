"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface Investment {
  id: string
  type: string
  currentValue: number
}

interface InvestmentsSummaryProps {
  investments: Investment[]
}

export function InvestmentsSummary({ investments }: InvestmentsSummaryProps) {
  const allocationData = [
    { name: "Renda Fixa", value: 40, color: "#22c55e" },
    { name: "Ações", value: 35, color: "#eab308" },
    { name: "FIIs", value: 25, color: "#ef4444" },
  ]

  const metrics = [
    { label: "Rentabilidade", value: "12,5%", color: "text-white" },
    { label: "Lucro", value: "R$ 4.200", color: "text-white" },
    { label: "Dividendos", value: "R$ 350", color: "text-white" },
  ]

  return (
    <Card className="bg-[#18181b] border-2 border-teal-500 rounded-lg shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Investimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ value }) => `${value}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ color: "#fff", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{metric.label}</span>
              <span className={`text-sm font-bold ${metric.color}`}>{metric.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
