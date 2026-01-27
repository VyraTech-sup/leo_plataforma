import { Pie } from "react-chartjs-2"

interface AllocationChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  title?: string
}

export function AllocationChart({ data, title }: AllocationChartProps) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: data.map(
          (d, i) =>
            d.color ||
            [
              "hsl(var(--info))",
              "hsl(var(--secondary))",
              "hsl(var(--destructive))",
              "hsl(var(--warning))",
              "hsl(var(--success))",
              "hsl(var(--muted))",
            ][i % 6]
        ),
        borderWidth: 1,
      },
    ],
  }
  return (
    <div className="bg-white rounded shadow p-4">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <Pie data={chartData} />
    </div>
  )
}
