import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import DashboardStats from "../components/dashboard/stats"
import { NetWorthChart } from "../components/dashboard/net-worth-chart"
import { ResultBarChart } from "../components/dashboard/result-bar-chart"
import { CategoryChart } from "../components/dashboard/category-chart"
import { InsightCard } from "../components/dashboard/insight-card"

// Mock data for dashboard widgets
describe("Dashboard Components", () => {
  it("renders DashboardStats with metrics", () => {
    render(
      <DashboardStats
        netWorth={10000}
        monthIncome={5000}
        monthExpense={3000}
        cashFlow={2000}
        savingsRate={20}
      />
    )
    expect(screen.getByText(/R\$ 10.000/i)).toBeDefined()
    expect(screen.getByText(/R\$ 5.000/i)).toBeDefined()
    expect(screen.getByText(/R\$ 3.000/i)).toBeDefined()
    expect(screen.getByText(/R\$ 2.000/i)).toBeDefined()
    // O componente não exibe savingsRate, então só verifica os valores principais
  })

  it("renders NetWorthChart with data", () => {
    render(
      <NetWorthChart
        transactions={[
          { date: "2024-01-01", amount: 1000, type: "INCOME" },
          { date: "2024-02-01", amount: 2000, type: "INCOME" },
          { date: "2024-03-01", amount: 3000, type: "EXPENSE" },
          { date: "2024-04-01", amount: 4000, type: "INCOME" },
        ]}
        initialBalance={5000}
      />
    )
    expect(screen.getByText(/Evolução Patrimonial/i)).toBeDefined()
  })

  it("renders ResultBarChart with data", () => {
    render(
      <ResultBarChart
        data={[
          { month: "2026-01", income: 1000, expense: 800, result: 200 },
          { month: "2026-02", income: 1200, expense: 900, result: 300 },
        ]}
      />
    )
    expect(screen.getByText(/Resumo de Resultados/i)).toBeDefined()
  })

  it("renders CategoryChart with data", () => {
    render(
      <CategoryChart
        transactions={[
          { date: "2024-01-01", amount: 500, type: "EXPENSE", category: "Alimentação" },
          { date: "2024-01-02", amount: 300, type: "EXPENSE", category: "Transporte" },
          { date: "2024-01-03", amount: 200, type: "INCOME", category: "Salário" },
        ]}
      />
    )
    expect(screen.getByText(/Gastos por Categoria/i)).toBeDefined()
  })

  it("renders InsightCard with insights", () => {
    render(
      <InsightCard
        cashFlow={2000}
        monthExpense={3000}
        monthIncome={5000}
        netWorthHistory={[1000, 2000, 3000, 4000]}
      />
    )
    expect(screen.getByText(/superávit/i)).toBeDefined()
  })
})
