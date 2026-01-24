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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const card = await prisma.card.findUnique({
      where: { id: params.id },
    })

    if (!card || card.userId !== session.user.id) {
      return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = cardSchema.parse(body)

    const updatedCard = await prisma.card.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error updating card:", error)
    return NextResponse.json({ error: "Erro ao atualizar cartão" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const card = await prisma.card.findUnique({
      where: { id: params.id },
    })

    if (!card || card.userId !== session.user.id) {
      return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 })
    }

    await prisma.card.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Cartão excluído com sucesso" })
  } catch (error) {
    console.error("Error deleting card:", error)
    return NextResponse.json({ error: "Erro ao excluir cartão" }, { status: 500 })
  }
}
