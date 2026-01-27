import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export interface InvestmentTableRow {
  id: string
  name: string
  type: string
  amount: number
  currentValue: number
  profitability: number
  profit: number
  percentOfPortfolio: number
  status: "positive" | "neutral" | "negative"
  institution: string
}

interface InvestmentTableProps {
  data: InvestmentTableRow[]
  onSelect: (id: string) => void
  filterType?: string
  onFilterType?: (type: string) => void
  onSortBy?: (col: string) => void
}

const typeLabels: Record<string, string> = {
  STOCKS: "Ações",
  BONDS: "Títulos",
  REAL_ESTATE: "Imóveis",
  FIXED_INCOME: "Renda Fixa",
  CRYPTO: "Cripto",
  FUNDS: "Fundos",
  OTHER: "Outro",
}

export function InvestmentTable({
  data,
  onSelect,
  filterType,
  onFilterType,
  onSortBy,
}: InvestmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 mb-2">
        <span className="font-semibold">Filtrar:</span>
        {Object.entries(typeLabels).map(([type, label]) => (
          <Badge
            key={type}
            variant={filterType === type ? "default" : "outline"}
            onClick={() => onFilterType?.(type)}
            className="cursor-pointer"
          >
            {label}
          </Badge>
        ))}
        <Badge variant={!filterType ? "default" : "outline"} onClick={() => onFilterType?.("")}>
          Todos
        </Badge>
      </div>
      <table className="min-w-full text-sm border rounded">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 cursor-pointer" onClick={() => onSortBy?.("name")}>
              Ativo
            </th>
            <th className="p-2 cursor-pointer" onClick={() => onSortBy?.("type")}>
              Classe
            </th>
            <th className="p-2 cursor-pointer" onClick={() => onSortBy?.("amount")}>
              Capital Investido
            </th>
            <th className="p-2 cursor-pointer" onClick={() => onSortBy?.("currentValue")}>
              Valor Atual
            </th>
            <th className="p-2 cursor-pointer" onClick={() => onSortBy?.("profitability")}>
              Retorno do Capital (%)
            </th>
            <th className="p-2 cursor-pointer" onClick={() => onSortBy?.("profit")}>
              Resultado acumulado do período
            </th>
            <th className="p-2 cursor-pointer" onClick={() => onSortBy?.("percentOfPortfolio")}>
              % da Carteira
            </th>
            <th className="p-2">Situação</th>
          </tr>
        </thead>
        <tbody>
          {data.map((inv) => (
            <tr
              key={inv.id}
              className="hover:bg-accent cursor-pointer"
              onClick={() => onSelect(inv.id)}
            >
              <td className="p-2 font-medium">{inv.name}</td>
              <td className="p-2">{typeLabels[inv.type] || inv.type}</td>
              <td className="p-2">R$ {inv.amount.toLocaleString()}</td>
              <td className="p-2">R$ {inv.currentValue.toLocaleString()}</td>
              <td className="p-2">{inv.profitability.toFixed(2)}%</td>
              <td className="p-2 flex items-center gap-1">
                {inv.profit >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
                <span className={inv.profit >= 0 ? "text-green-700" : "text-red-700"}>
                  R$ {inv.profit.toLocaleString()}
                </span>
              </td>
              <td className="p-2">{inv.percentOfPortfolio.toFixed(1)}%</td>
              <td className="p-2">
                <Badge
                  variant={
                    inv.status === "positive"
                      ? "default"
                      : inv.status === "negative"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {inv.status === "positive"
                    ? "Evolução positiva (acima do capital investido)"
                    : inv.status === "negative"
                      ? "Oscilação negativa (variação não realizada)"
                      : "Estável no período"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
