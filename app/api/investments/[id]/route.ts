import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const investmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["STOCKS", "BONDS", "REAL_ESTATE", "FIXED_INCOME", "CRYPTO", "FUNDS", "OTHER"]),
  amount: z.number().positive("Valor investido deve ser positivo"),
  currentValue: z.number().positive("Valor atual deve ser positivo"),
  quantity: z.number().positive().optional(),
  institution: z.string().min(1, "Instituição é obrigatória"),
  ticker: z.string().optional(),
  acquiredAt: z.string(),
  maturityDate: z.string().optional(),
  profitability: z.number().optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const investment = await prisma.investment.findUnique({
      where: { id: params.id },
    })

    if (!investment || investment.userId !== session.user.id) {
      return NextResponse.json({ error: "Investimento não encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = investmentSchema.parse(body)

    const updatedInvestment = await prisma.investment.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        acquiredAt: new Date(validatedData.acquiredAt),
        maturityDate: validatedData.maturityDate ? new Date(validatedData.maturityDate) : null,
      },
    })

    return NextResponse.json(updatedInvestment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error updating investment:", error)
    return NextResponse.json({ error: "Erro ao atualizar investimento" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const investment = await prisma.investment.findUnique({
      where: { id: params.id },
    })

    if (!investment || investment.userId !== session.user.id) {
      return NextResponse.json({ error: "Investimento não encontrado" }, { status: 404 })
    }

    await prisma.investment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Investimento excluído com sucesso" })
  } catch (error) {
    console.error("Error deleting investment:", error)
    return NextResponse.json({ error: "Erro ao excluir investimento" }, { status: 500 })
  }
}
