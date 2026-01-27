import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CategoryBudgetBlockProps {
  categories: Array<{
    category: string
    budget: number
    spent: number
  }>
}

function getStatus(percent: number) {
  if (percent <= 1) return "verde"
  if (percent <= 1.1) return "amarelo"
  return "vermelho"
}

export function CategoryBudgetBlock({ categories }: CategoryBudgetBlockProps) {
  const router = useRouter()
  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orçamento por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Nenhum orçamento cadastrado para este período. Orçamentos são aliados para planejar sem
            culpa e ajustar o que for preciso, sempre que necessário. Que tal começar definindo um
            limite para a categoria mais relevante para você?
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="px-2 py-1 text-left">Categoria</th>
                <th className="px-2 py-1 text-right">Limite Planejado</th>
                <th className="px-2 py-1 text-right">Total Gasto</th>
                <th className="px-2 py-1 text-right">% do Limite</th>
                <th className="px-2 py-1 text-center">Situação</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const percent = cat.budget > 0 ? cat.spent / cat.budget : 0
                const status = getStatus(percent)
                let statusTooltip =
                  "Gasto dentro do limite previsto para a categoria. Continue acompanhando para manter o controle."
                if (status === "amarelo") {
                  statusTooltip =
                    "Atenção: você está se aproximando do limite. Pequenos ajustes agora evitam surpresas no fim do mês."
                } else if (status === "vermelho") {
                  statusTooltip =
                    "O orçamento foi ultrapassado. Use este dado para replanejar, sem culpa: todo mês é uma nova chance de ajustar."
                }
                return (
                  <tr
                    key={cat.category}
                    className="border-b last:border-b-0 cursor-pointer hover:bg-muted"
                    onClick={() =>
                      router.push(
                        `/dashboard/transactions?category=${encodeURIComponent(cat.category)}`
                      )
                    }
                  >
                    <td className="px-2 py-1">{cat.category}</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(cat.budget)}</td>
                    <td className="px-2 py-1 text-right">{formatCurrency(cat.spent)}</td>
                    <td
                      className="px-2 py-1 text-right"
                      title="Percentual do limite já utilizado. Se necessário, ajuste o valor do orçamento ou os gastos para manter o controle."
                    >
                      {(percent * 100).toFixed(0)}%
                    </td>
                    <td className="px-2 py-1 text-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${status === "verde" ? "bg-green-500" : status === "amarelo" ? "bg-yellow-400" : "bg-red-500"}`}
                        title={statusTooltip}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
