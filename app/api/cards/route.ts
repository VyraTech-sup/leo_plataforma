import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const cardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  lastFourDigits: z.string().length(4, "Últimos 4 dígitos são obrigatórios"),
  brand: z.string().min(1, "Bandeira é obrigatória"),
  limit: z.number().positive("Limite deve ser positivo"),
  closingDay: z.number().min(1).max(31, "Dia de fechamento inválido"),
  dueDay: z.number().min(1).max(31, "Dia de vencimento inválido"),
  color: z.string().optional(),
})

export async function GET(_: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const cards = await prisma.card.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error("Error fetching cards:", error)
    return NextResponse.json({ error: "Erro ao buscar cartões" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = cardSchema.parse(body)

    const card = await prisma.card.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating card:", error)
    return NextResponse.json({ error: "Erro ao criar cartão" }, { status: 500 })
  }
}
