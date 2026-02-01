"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

interface InsightCardProps {
  netWorth: number
  cashFlow: number
  monthExpense: number
  monthIncome: number
}

export function InsightCard({ netWorth, cashFlow, monthExpense, monthIncome }: InsightCardProps) {
  const generateInsight = () => {
    if (cashFlow > 0) {
      return "Você teve superávit este mês! Seu patrimônio está crescendo 📈"
    }
    if (cashFlow < 0) {
      return "Atenção! Suas despesas superaram suas receitas este mês. Revise seus gastos."
    }
    return "Suas receitas e despesas estão equilibradas. Considere aumentar seus investimentos."
  }

  return (
    <Card className="bg-[#18181b] border-2 border-teal-500 rounded-lg shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-full">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Insights</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{generateInsight()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
