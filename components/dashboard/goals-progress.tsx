"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"

interface Goal {
  id: string
  name: string
  targetAmount: { toString: () => string }
  currentAmount: { toString: () => string }
  priority: string
}

interface GoalsProgressProps {
  goals: Goal[]
}

export function GoalsProgress({ goals }: GoalsProgressProps) {
  const topGoals = goals.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas</CardTitle>
        <CardDescription>Progresso das suas principais metas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada</p>
        ) : (
          topGoals.map((goal) => {
            const target = Number(goal.targetAmount)
            const current = Number(goal.currentAmount)
            const percentage = target > 0 ? (current / target) * 100 : 0

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(current)} / {formatCurrency(target)}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
