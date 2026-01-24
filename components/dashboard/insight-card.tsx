"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, TrendingUp, AlertTriangle, Info } from "lucide-react"

interface InsightCardProps {
  insights: string[]
}

export function InsightCard({ insights }: InsightCardProps) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights
          </CardTitle>
          <CardDescription>Análise inteligente das suas finanças</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Adicione mais transações para gerar insights personalizados
          </p>
        </CardContent>
      </Card>
    )
  }

  const getIcon = (insight: string) => {
    if (insight.toLowerCase().includes('atenção') || insight.toLowerCase().includes('alerta')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
    if (insight.toLowerCase().includes('excelente') || insight.toLowerCase().includes('parabéns')) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    }
    return <Info className="h-4 w-4 text-blue-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights
        </CardTitle>
        <CardDescription>Análise inteligente das suas finanças</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            {getIcon(insight)}
            <p className="flex-1">{insight}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
