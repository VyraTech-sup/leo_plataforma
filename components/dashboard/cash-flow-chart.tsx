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
;("use client")

export interface Transaction {
  date: string
  amount: number
  type: "INCOME" | "EXPENSE"
}

export interface CashFlowChartProps {
  transactions: Transaction[]
}

function getMonthYear(date: Date) {
  return `${date.getMonth() + 1}/${date.getFullYear()}`
}

export function CashFlowChart({ transactions }: CashFlowChartProps) {
  // Filtra transações do mês atual
  const now = new Date()
  const currentMonth = getMonthYear(now)
  const filtered = transactions.filter((tx) => getMonthYear(new Date(tx.date)) === currentMonth)
  const income = filtered
    .filter((tx) => tx.type === "INCOME")
    .reduce((acc, tx) => acc + tx.amount, 0)
  const expense = filtered
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((acc, tx) => acc + tx.amount, 0)
  const chartData = [
    {
      name: now.toLocaleDateString("pt-BR", { month: "long", year: "2-digit" }),
      Receita: income,
      Despesa: expense,
    },
  ]

  return (
    <Card className="bg-[#18181b] border-2 border-teal-500 rounded-lg shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-400">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-400">Despesa</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barCategoryGap={40} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #14b8a6",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: number) => formatCurrency(value as number)}
            />
            <Bar dataKey="Receita" fill="#22c55e" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesa" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
