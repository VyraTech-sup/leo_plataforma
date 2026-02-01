"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
}

interface GoalsProgressProps {
  goals: Goal[]
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
  const defaultGoals = [
    { id: "1", name: "Reserva Emergência", targetAmount: 10000, currentAmount: 6500 },
    { id: "2", name: "Viagem", targetAmount: 5000, currentAmount: 2250 },
    { id: "3", name: "Investimentos", targetAmount: 20000, currentAmount: 16000 },
  ]

  const displayGoals = goals.length > 0 ? goals : defaultGoals

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-teal-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getTextColor = (percentage: number) => {
    if (percentage >= 80) return "text-teal-500"
    if (percentage >= 50) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <Card className="bg-[#18181b] border-2 border-teal-500 rounded-lg shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Progresso de Metas</CardTitle>
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
                <span className={`text-sm font-bold ${textColor}`}>{percentage}%</span>
              </div>
              <Progress value={percentage} className={`h-2 ${progressColor}`} />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
