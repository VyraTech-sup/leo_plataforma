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
        <CardTitle>Progresso das Metas Prioritárias</CardTitle>
        <CardDescription>
          Acompanhe o avanço das metas mais relevantes para seu planejamento financeiro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma meta cadastrada ainda. Defina uma prioridade para transformar planos em
            conquistas reais, no seu tempo. Cada meta é um passo a mais para o seu futuro
            financeiro.
          </p>
        ) : (
          topGoals.map((goal) => {
            const target = Number(goal.targetAmount)
            const current = Number(goal.currentAmount)
            const percentage = target > 0 ? (current / target) * 100 : 0

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{goal.name}</span>
                  <span
                    className="text-muted-foreground"
                    title="Percentual indica quanto do objetivo já foi alcançado. Se necessário, ajuste o valor mensal para garantir o prazo desejado."
                  >
                    {formatCurrency(current)} / {formatCurrency(target)}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {percentage >= 100
                    ? "Meta atingida! Que tal definir um novo objetivo ou comemorar essa conquista?"
                    : percentage >= 80
                      ? "Você está muito próximo da sua meta. Pequenos ajustes podem antecipar o resultado."
                      : percentage < 40
                        ? "Todo começo exige adaptação. Ajuste o valor ou o prazo conforme sua realidade."
                        : "Bom progresso! Se quiser acelerar, aumente o valor mensal ou revise o prazo."}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
