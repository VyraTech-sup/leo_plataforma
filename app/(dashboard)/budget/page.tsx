"use client"
import { TooltipProgressiva } from "@/components/tooltip-progressiva"
import { useState, useEffect } from "react"

export default function BudgetPage() {
  // Exemplo: fetch orçamento do mês atual
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parceladoSpent, setParceladoSpent] = useState(0)
  const month = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/budget?month=${month}`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || [])
        const p = data.categories.find((c: any) => c.category === "Parcelado")
        setParceladoSpent(p?.spent || 0)
      })
      .catch(() => setError("Erro ao buscar orçamento"))
      .finally(() => setLoading(false))
  }, [month])

  // Critério: se gasto com parcelados > 30% do total orçado
  const totalBudget = categories.reduce((sum, c) => sum + (c.budget || 0), 0)
  const pressure = parceladoSpent > totalBudget * 0.3 && parceladoSpent > 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <TooltipProgressiva
        id="budget_edit"
        text="Defina limites para cada categoria. Ajuste sempre que necessário para manter o controle."
        cta="Ajustar agora"
      >
        <h2 className="text-2xl font-bold mb-2">Orçamento Mensal</h2>
      </TooltipProgressiva>
      {loading ? (
        <div>Carregando orçamento...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="mb-4">
            <div className="font-semibold mb-2">Impacto dos Parcelados</div>
            <div className="text-lg font-bold">R$ {parceladoSpent.toLocaleString()} / mês</div>
            {pressure && (
              <div className="text-yellow-700 bg-yellow-100 rounded px-2 py-1 mt-2">
                Aviso: Parcelados comprometem mais de 30% do orçamento mensal!
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-2">Categorias</div>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.category} className={cat.category === "Parcelado" ? "font-bold" : ""}>
                  {cat.category}: R$ {cat.spent.toLocaleString()} / R$ {cat.budget.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
