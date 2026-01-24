import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const goalSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  targetAmount: z.number().positive("Valor alvo deve ser positivo"),
  deadline: z.string().datetime("Data inválida"),
  category: z.string().min(1, "Categoria é obrigatória"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined

    const where: any = {
      userId: session.user.id,
    }
    if (status) where.status = status

    const goals = await prisma.goal.findMany({
      where,
      include: {
        contributions: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
      orderBy: { deadline: "asc" },
    })

    // Calcular progresso e projeções
    const enrichedGoals = goals.map((goal) => {
      const progress = Number(goal.targetAmount) > 0 
        ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100 
        : 0

      const daysRemaining = Math.ceil(
        (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30))
      const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)
      const monthlyTarget = remaining > 0 ? remaining / monthsRemaining : 0

      return {
        ...goal,
        progress,
        daysRemaining,
        monthlyTarget,
        remaining,
      }
    })

    return NextResponse.json(enrichedGoals)
  } catch (error) {
    console.error("Erro ao buscar metas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validated = goalSchema.parse(body)

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        description: validated.description,
        targetAmount: validated.targetAmount,
        deadline: new Date(validated.deadline),
        category: validated.category,
        status: "ACTIVE",
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar meta:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
