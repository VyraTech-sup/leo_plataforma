import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProgressiva } from "@/components/tooltip-progressiva"

interface InvestmentDrilldownProps {
  investment: {
    id: string
    name: string
    type: string
    amount: number
    currentValue: number
    profitability: number
    profit: number
    institution: string
    ticker?: string | null
    acquiredAt: string
    maturityDate?: string | null
    history: Array<{ date: string; value: number; aportes?: number; retiradas?: number }>
    dividends: Array<{ month: string; value: number }>
  }
  onClose: () => void
}

export function InvestmentDrilldown({ investment, onClose }: InvestmentDrilldownProps) {
  const totalDividends = investment.dividends.reduce((sum, d) => sum + d.value, 0)
  const avgDividends =
    investment.dividends.length > 0 ? totalDividends / investment.dividends.length : 0
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <TooltipProgressiva
          id="investment_drilldown"
          text="Veja detalhes do ativo, evolução e rendimentos. Use para ajustar sua estratégia."
          cta="Entendi"
        >
          <CardTitle>Detalhamento do Ativo Financeiro</CardTitle>
        </TooltipProgressiva>
      </CardHeader>
      <CardContent>
        <div className="mb-2 font-semibold">
          {investment.name} {investment.ticker ? `(${investment.ticker})` : ""}
        </div>
        <div>Classe: {investment.type}</div>
        <div>Instituição: {investment.institution}</div>
        <div>
          Capital investido: <b>R$ {investment.amount.toLocaleString()}</b>
        </div>
        <div>
          Valor de mercado atual: <b>R$ {investment.currentValue.toLocaleString()}</b>
        </div>
        <div>
          Retorno do capital investido: <b>{investment.profitability.toFixed(2)}%</b>
        </div>
        <div>
          Resultado acumulado do período: <b>R$ {investment.profit.toLocaleString()}</b>
        </div>
        <div className="mt-4 font-semibold">Histórico de evolução</div>
        <ul className="text-xs mb-2">
          {investment.history.length === 0 ? (
            <li>Nenhum histórico disponível para este ativo.</li>
          ) : (
            investment.history.map((h, i) => (
              <li key={i}>
                {h.date}: R$ {h.value.toLocaleString()}{" "}
                {h.aportes ? `(+Aporte: R$ ${h.aportes}) ` : ""}
                {h.retiradas ? `(-Retirada: R$ ${h.retiradas})` : ""}
              </li>
            ))
          )}
        </ul>
        <div className="mt-4 font-semibold">Renda gerada (dividendos, juros, rendimentos)</div>
        <ul className="text-xs mb-2">
          {investment.dividends.length === 0 ? (
            <li>Nenhuma renda registrada para este ativo.</li>
          ) : (
            investment.dividends.map((d, i) => (
              <li key={i}>
                {d.month}: R$ {d.value.toLocaleString()}
              </li>
            ))
          )}
        </ul>
        <div>
          Média mensal de renda: <b>R$ {avgDividends.toLocaleString()}</b>
        </div>
        <div>
          Total acumulado de renda: <b>R$ {totalDividends.toLocaleString()}</b>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Este ativo contribui para o crescimento do seu patrimônio e pode apoiar o alcance de metas
          financeiras.
        </div>
        <button className="mt-4 px-4 py-2 bg-muted rounded" onClick={onClose}>
          Fechar
        </button>
      </CardContent>
    </Card>
  )
}
