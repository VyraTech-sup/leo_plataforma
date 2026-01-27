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
    <div className="flex items-center gap-2 mb-4">
      <button onClick={onPrev} className="p-2 rounded hover:bg-muted" aria-label="Mês anterior">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={onYearView}
        className="flex items-center gap-1 px-3 py-1 rounded hover:bg-muted font-medium"
      >
        <Calendar className="w-4 h-4" />
        {isYearView ? "Ano" : month}
      </button>
      <button onClick={onNext} className="p-2 rounded hover:bg-muted" aria-label="Próximo mês">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
