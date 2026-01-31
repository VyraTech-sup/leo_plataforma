import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface MonthSelectorProps {
  month: string
  onPrev: () => void
  onNext: () => void
  onYearView: () => void
  isYearView: boolean
}

export function MonthSelector({
  month,
  onPrev,
  onNext,
  onYearView,
  isYearView,
}: MonthSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-1 mb-4">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="p-2 rounded hover:bg-muted" aria-label="Mês anterior">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onYearView}
          className="flex items-center gap-1 px-3 py-1 rounded font-bold border border-primary bg-primary/10 text-primary shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          {isYearView ? "Ano" : month}
        </button>
        <button onClick={onNext} className="p-2 rounded hover:bg-muted" aria-label="Próximo mês">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <span className="text-xs text-muted-foreground mt-1">
        Selecione o período para analisar resultados e projeções. O mês atual está destacado.
      </span>
    </div>
  )
}
