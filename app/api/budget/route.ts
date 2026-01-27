import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// API: /api/budget?month=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    if (!month) {
      return NextResponse.json({ error: "Mês não informado" }, { status: 400 })
    }
    // Parse YYYY-MM
    const [year, m] = month.split("-").map(Number)
    if (!Number.isFinite(year) || !Number.isFinite(m)) {
      return NextResponse.json({ error: "Mês inválido" }, { status: 400 })
    }
    const y = year as number
    const mm = m as number
    const start = new Date(y, mm - 1, 1)
    const end = new Date(y, mm, 1)

    // Busca orçamentos definidos pelo usuário
    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id, month },
      select: { category: true, amount: true },
    })

    // Busca gastos reais por categoria
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        date: { gte: start, lt: end },
      },
      select: { category: true, amount: true },
    })
    const spentMap = new Map<string, number>()
    transactions.forEach((t) => {
      spentMap.set(t.category, (spentMap.get(t.category) || 0) + Number(t.amount))
    })

    // Monta lista de categorias
    const allCategories = Array.from(
      new Set([...budgets.map((b) => b.category), ...transactions.map((t) => t.category)])
    )

    const categories = allCategories.map((category) => {
      const budget = budgets.find((b) => b.category === category)?.amount || 0
      const spent = spentMap.get(category) || 0
      return { category, budget, spent }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Erro orçamento:", error)
    return NextResponse.json({ error: "Erro ao buscar orçamento" }, { status: 500 })
  }
}
