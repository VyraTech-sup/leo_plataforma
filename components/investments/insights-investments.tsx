interface InsightsInvestmentsProps {
  insights: string[]
}

export function InsightsInvestments({ insights }: InsightsInvestmentsProps) {
  if (!insights || insights.length === 0) return null
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-2">Insights de Investimentos</h3>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        {insights.map((insight, i) => (
          <li key={i} className="text-blue-900">
            {insight}
          </li>
        ))}
      </ul>
    </div>
  )
}
