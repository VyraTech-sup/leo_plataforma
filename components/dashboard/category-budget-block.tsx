import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
  const [selected, setSelected] = useState<null | (typeof categories)[0]>(null)
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
    <>
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
                      onClick={() => setSelected(cat)}
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
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground"
              onClick={() => setSelected(null)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-2">Detalhe da Categoria: {selected.category}</h3>
            <ul className="mb-4 space-y-1 text-sm">
              <li>
                <strong>Limite Planejado:</strong> {formatCurrency(selected.budget)}
              </li>
              <li>
                <strong>Total Gasto:</strong> {formatCurrency(selected.spent)}
              </li>
              <li>
                <strong>Percentual Utilizado:</strong>{" "}
                {selected.budget > 0 ? ((selected.spent / selected.budget) * 100).toFixed(1) : "0"}%
              </li>
              <li>
                <strong>Situação:</strong>{" "}
                {(() => {
                  const percent = selected.budget > 0 ? selected.spent / selected.budget : 0
                  if (percent <= 1) return "Dentro do limite"
                  if (percent <= 1.1) return "Atenção: próximo do limite"
                  return "Limite ultrapassado"
                })()}
              </li>
              {selected.budget > 0 && selected.spent > selected.budget && (
                <li>
                  <strong>Extrapolação:</strong> Ultrapassou o orçamento em{" "}
                  {formatCurrency(selected.spent - selected.budget)}
                </li>
              )}
            </ul>
            <p className="text-xs text-muted-foreground mb-2">
              Este detalhamento mostra quanto já foi gasto, quanto ainda pode gastar e, se
              extrapolou, quanto e por quê. Use essas informações para ajustar seu planejamento sem
              culpa.
            </p>
            <button
              className="mt-2 px-4 py-2 rounded bg-primary text-white font-semibold"
              onClick={() => {
                setSelected(null)
                router.push(
                  `/dashboard/transactions?category=${encodeURIComponent(selected.category)}`
                )
              }}
            >
              Ver Movimentações
            </button>
          </div>
        </div>
      )}
    </>
  )
}
