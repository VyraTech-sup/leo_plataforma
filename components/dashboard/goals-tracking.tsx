"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle } from "lucide-react"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
}

interface GoalsTrackingProps {
  goals: Goal[]
}

export function GoalsTracking({ goals }: GoalsTrackingProps) {
  const defaultGoals = [
    { id: "1", name: "Alimentação", targetAmount: 1000, currentAmount: 890 },
    { id: "2", name: "Transporte", targetAmount: 500, currentAmount: 225 },
    { id: "3", name: "Lazer", targetAmount: 500, currentAmount: 600 },
  ]

  const displayGoals = goals.length > 0 ? goals : defaultGoals

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return "bg-red-500"
    if (percentage >= 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getTextColor = (percentage: number) => {
    if (percentage > 100) return "text-red-500"
    if (percentage >= 80) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Card className="bg-[#18181b] border-2 border-teal-500 rounded-lg shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Acompanhamento de Metas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayGoals.slice(0, 3).map((goal) => {
          const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100)
          const progressColor = getProgressColor(percentage)
          const textColor = getTextColor(percentage)

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{goal.name}</span>
                <div className="flex items-center gap-2">
                  {percentage > 100 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  <span className={`text-sm font-bold ${textColor}`}>{percentage}%</span>
                </div>
              </div>
              <Progress value={Math.min(percentage, 100)} className={`h-2 ${progressColor}`} />
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatCurrency(goal.currentAmount)}</span>
                <span>{formatCurrency(goal.targetAmount)}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
