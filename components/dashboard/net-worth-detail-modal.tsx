interface NetWorthDetailProps {
  month: string
  netWorth: number
  variation: number
  aportes: number
  resgates: number
  rendimentos: number
  onClose: () => void
}

export function NetWorthDetailModal({
  month,
  netWorth,
  variation,
  aportes,
  resgates,
  rendimentos,
  onClose,
}: NetWorthDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold mb-2">Detalhamento - {month}</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Patrimônio final:</span>{" "}
            <span>{netWorth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Variação no mês:</span>{" "}
            <span>{variation.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Aportes:</span>{" "}
            <span>{aportes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Resgates:</span>{" "}
            <span>{resgates.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Rendimentos:</span>{" "}
            <span>
              {rendimentos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
