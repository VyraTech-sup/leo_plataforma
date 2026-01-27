import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { TransactionType } from "@prisma/client"
import { z } from "zod"

const createInstallmentSchema = z.object({
  description: z.string().min(1),
  totalValue: z.number().positive(),
  totalInstallments: z.number().int().min(2),
  startDate: z.string(), // ISO
})

// POST /api/cards/[id]/create-installment
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const body = await request.json()
    const { description, totalValue, totalInstallments, startDate } =
      createInstallmentSchema.parse(body)
    const cardId = params.id
    // Cria InstallmentGroup
    const group = await prisma.installmentGroup.create({
      data: {
        userId: session.user.id,
        cardId,
        description,
        totalValue,
        totalInstallments,
        startDate: new Date(startDate),
      },
    })
    // Cria N transactions (uma por mês)
    const transactions = []
    for (let i = 1; i <= totalInstallments; i++) {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + i - 1)
      transactions.push({
        userId: session.user.id,
        cardId,
        description: `${description} (${i}/${totalInstallments})`,
        amount: (totalValue / totalInstallments).toFixed(2),
        type: TransactionType.EXPENSE,
        category: "Parcelado",
        date,
        installmentGroupId: group.id,
        totalInstallments,
        currentInstallment: i,
        installmentValue: (totalValue / totalInstallments).toFixed(2),
      })
    }
    await prisma.transaction.createMany({ data: transactions })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating installment:", error)
    return NextResponse.json({ error: "Erro ao criar parcelamento" }, { status: 500 })
  }
}
