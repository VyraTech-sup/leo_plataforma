// PATCH: /api/budget/drilldown?month=YYYY-MM&category=...  (body: { amount: number, mode: "single" | "replicate" })
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const category = searchParams.get("category")
    if (!month || !category) {
      return NextResponse.json({ error: "Parâmetros obrigatórios" }, { status: 400 })
    }
    const body = await request.json()
    const amount = Number(body.amount)
    const mode = body.mode === "replicate" ? "replicate" : "single"
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
    }

    if (mode === "single") {
      // Atualiza ou cria orçamento apenas para o mês selecionado
      await prisma.budget.upsert({
        where: { userId_category_month: { userId: session.user.id, category, month } },
        update: { amount },
        create: { userId: session.user.id, category, month, amount },
      })
    } else {
      // Replicar para todos os meses futuros (incluindo o atual)
      const now = new Date()
      const [year, m] = month.split("-").map(Number)
      if (!Number.isFinite(year)Number.isFinite(m)) {
        return NextResponse.json({ error: "Mês inválido" }, { status: 400 })
      }
      const y = year as number
      const mm = m as number
      const startMonth = new Date(y, mm - 1, 1)
      // Busca todos os meses de metas futuras (até 24 meses à frente)
      for (let i = 0; i < 24; i++) {
        const targetMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1)
        if (targetMonth < now) continue
        const targetMonthStr = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, "0")}`
        await prisma.budget.upsert({
          where: {
            userId_category_month: { userId: session.user.id, category, month: targetMonthStr },
          },
          update: { amount },
          create: { userId: session.user.id, category, month: targetMonthStr, amount },
        })
      }
    }

    // Após atualizar, retorna drilldown recalculado
    // (reaproveita lógica do GET)
    const req = new Request(request.url, { method: "GET", headers: request.headers })
    // @ts-ignore
    return await GET(req)
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error)
    return NextResponse.json({ error: "Erro ao atualizar orçamento" }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// /api/budget/drilldown?month=YYYY-MM&category=...
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const category = searchParams.get("category")
    if (!month || !category) {
      return NextResponse.json({ error: "Parâmetros obrigatórios" }, { status: 400 })
    }
    const [year, m] = month.split("-").map(Number)
    if (!Number.isFinite(year) || !Number.isFinite(m)) {
      return NextResponse.json({ error: "Mês inválido" }, { status: 400 })
    }
    const y = year as number
    const mm = m as number
    const start = new Date(y, mm - 1, 1)
    const end = new Date(y, mm, 1)

    // Orçamento do mês
    const budgetObj = await prisma.budget.findFirst({
      where: { userId: session.user.id, month, category },
    })
    const budget = Number(budgetObj?.amount) || 0

    // Gasto do mês
    const spentAgg = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        category,
        date: { gte: start, lt: end },
      },
      _sum: { amount: true },
    })
    const spent = Number(spentAgg._sum.amount) || 0

    // Transações do mês
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        category,
        date: { gte: start, lt: end },
      },
      select: { id: true, date: true, description: true, amount: true },
      orderBy: { date: "desc" },
    })

    // Histórico dos últimos 6 meses
    const history = []
    for (let i = 5; i >= 0; i--) {
      const histMonth = new Date(y, mm - 1 - i, 1)
      const histMonthStr = `${histMonth.getFullYear()}-${String(histMonth.getMonth() + 1).padStart(2, "0")}`
      const histStart = new Date(histMonth.getFullYear(), histMonth.getMonth(), 1)
      const histEnd = new Date(histMonth.getFullYear(), histMonth.getMonth() + 1, 1)
      const histSpentAgg = await prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "EXPENSE",
          category,
          date: { gte: histStart, lt: histEnd },
        },
        _sum: { amount: true },
      })
      history.push({
        month: histMonthStr,
        spent: Number(histSpentAgg._sum.amount) || 0,
      })
    }

    // Insight analítico simples (exemplo)
    let insight = ""
    const percent = budget > 0 ? spent / budget : 0
    if (percent < 0.8)
      insight = `Você já utilizou ${(percent * 100).toFixed(0)}% do orçamento de ${category}.`
    else if (percent < 1)
      insight = `Atenção: ${category} está próximo do limite (${(percent * 100).toFixed(0)}%).`
    else if (percent < 1.2)
      insight = `Alerta: ${category} já excedeu o orçamento em ${(percent * 100 - 100).toFixed(0)}%.`
    else insight = `Crítico: ${category} está muito acima do planejado!`

    // Buscar metas ativas relacionadas à categoria
    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
        category,
        status: "ACTIVE",
      },
      orderBy: { deadline: "asc" },
    })

    // Calcular projeção de impacto para cada meta
    const now = new Date()
    const goalsWithProjection = goals.map((goal) => {
      const targetAmount = Number(goal.targetAmount)
      const currentAmount = Number(goal.currentAmount)
      const deadline = new Date(goal.deadline)
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30))
      const remaining = targetAmount - currentAmount
      const monthlyTarget = remaining > 0 ? remaining / monthsRemaining : 0
      const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0

      // Projeção: quanto sobra para a meta se o gasto continuar igual
      // Supondo que "budget - spent" é o potencial de economia mensal para a meta
      let impact = ""
      if (budget > 0 && spent > 0) {
        const potentialSaving = budget - spent
        if (potentialSaving <= 0) {
          impact = `Com o gasto atual, não há sobra para a meta. Reavalie o orçamento ou aumente receitas.`
        } else if (potentialSaving >= monthlyTarget) {
          const monthsToGoal = Math.ceil(remaining / potentialSaving)
          if (monthsToGoal <= monthsRemaining) {
            impact = `Se mantiver esse ritmo, você atinge a meta em ${monthsToGoal} meses, antes do prazo!`
          } else {
            impact = `Com a economia atual, a meta será atingida em ${monthsToGoal} meses, após o prazo previsto.`
          }
        } else {
          impact = `A economia mensal atual (${potentialSaving.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) é insuficiente para atingir a meta até o prazo. Considere reduzir gastos ou aumentar aportes.`
        }
      } else {
        impact = `Defina um orçamento para esta categoria para calcular o impacto nas metas.`
      }

      return {
        id: goal.id,
        name: goal.name,
        targetAmount,
        currentAmount,
        deadline: goal.deadline,
        progress,
        monthlyTarget,
        remaining,
        impact,
      }
    })

    return NextResponse.json({
      budget,
      spent,
      transactions,
      history,
      insight,
      goals: goalsWithProjection,
    })
  } catch (error) {
    console.error("Erro drilldown:", error)
    return NextResponse.json({ error: "Erro ao buscar drilldown" }, { status: 500 })
  }
}
