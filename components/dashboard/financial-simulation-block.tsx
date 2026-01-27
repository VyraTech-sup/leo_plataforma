import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function FinancialSimulationBlock({ onSimulate }: { onSimulate: (params: any) => void }) {
  const [aporte, setAporte] = useState(500)
  const [varReceita, setVarReceita] = useState(0)
  const [varDespesa, setVarDespesa] = useState(0)
  const [prazo, setPrazo] = useState(12)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Simulação Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Inputs */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs mb-1">Aporte Mensal</label>
              <input
                type="number"
                className="input"
                value={aporte}
                onChange={(e) => setAporte(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Variação Receita (%)</label>
              <input
                type="number"
                className="input"
                value={varReceita}
                onChange={(e) => setVarReceita(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Variação Despesas (%)</label>
              <input
                type="number"
                className="input"
                value={varDespesa}
                onChange={(e) => setVarDespesa(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Prazo (meses)</label>
              <input
                type="number"
                className="input"
                value={prazo}
                onChange={(e) => setPrazo(Number(e.target.value))}
              />
            </div>
            <Button
              className="mt-2 w-full"
              onClick={() => onSimulate({ aporte, varReceita, varDespesa, prazo })}
            >
              Simular
            </Button>
          </div>
          {/* Resultados */}
          <div className="flex-1 space-y-2">
            {/* Resultados da simulação serão exibidos pelo dashboard */}
            <div className="text-xs text-muted-foreground">
              Resultados aparecerão aqui após a simulação.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
