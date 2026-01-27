import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface GoalStatus {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  dueDate: string
  status: "no ritmo" | "atrasada" | "adiantada"
  canReach: boolean
}

interface GoalsStatusBlockProps {
  goals: GoalStatus[]
}

export function GoalsStatusBlock({ goals }: GoalsStatusBlockProps) {
  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acompanhamento de Metas Financeiras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Nenhuma meta ativa neste período. Defina objetivos claros para potencializar seu
            planejamento financeiro.
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acompanhamento de Metas Financeiras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="px-2 py-1 text-left">Meta</th>
                <th className="px-2 py-1 text-right">Valor Alvo</th>
                <th className="px-2 py-1 text-right">Acumulado</th>
                <th className="px-2 py-1 text-center">Situação</th>
                <th className="px-2 py-1 text-center">Prazo Final</th>
                <th className="px-2 py-1 text-center">Projeção de Conquista</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => (
                <tr key={goal.id} className="border-b last:border-b-0">
                  <td className="px-2 py-1">{goal.name}</td>
                  <td className="px-2 py-1 text-right">{formatCurrency(goal.targetAmount)}</td>
                  <td className="px-2 py-1 text-right">{formatCurrency(goal.currentAmount)}</td>
                  <td className="px-2 py-1 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${goal.status === "no ritmo" ? "bg-green-100 text-green-800" : goal.status === "adiantada" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}
                      title={
                        goal.status === "no ritmo"
                          ? "Você está no ritmo planejado para atingir sua meta no prazo. Mantenha o foco e ajuste se necessário."
                          : goal.status === "adiantada"
                            ? "Parabéns! Sua meta está adiantada. Você pode antecipar conquistas ou revisar o objetivo para novos desafios."
                            : "Ajuste de rota recomendado: pequenas mudanças agora podem garantir o sucesso no prazo desejado."
                      }
                    >
                      {goal.status === "no ritmo"
                        ? "No ritmo planejado"
                        : goal.status === "adiantada"
                          ? "Adiantada (acima do esperado)"
                          : "Ajuste de rota recomendado"}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-center">{goal.dueDate}</td>
                  <td className="px-2 py-1 text-center">
                    {goal.canReach ? (
                      <span className="text-green-600">Sim</span>
                    ) : (
                      <span className="text-red-600">Não</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
