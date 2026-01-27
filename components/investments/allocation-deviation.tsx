interface AllocationDeviationProps {
  actual: Array<{ label: string; value: number }>
  target: Array<{ label: string; value: number }>
}

export function AllocationDeviation({ actual, target }: AllocationDeviationProps) {
  // Map for quick lookup
  const targetMap = new Map(target.map((t) => [t.label, t.value]))
  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <div className="font-semibold mb-2">Desvios de Alocação</div>
      <ul className="text-sm space-y-1">
        {actual.map((a) => {
          const ideal = targetMap.get(a.label) || 0
          const diff = a.value - ideal
          if (Math.abs(diff) < 0.5) return null
          return (
            <li key={a.label} className={diff > 0 ? "text-yellow-700" : "text-blue-700"}>
              {diff > 0
                ? `Você está ${diff.toFixed(1)}% acima do ideal em ${a.label}`
                : `Você está ${Math.abs(diff).toFixed(1)}% abaixo do ideal em ${a.label}`}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
