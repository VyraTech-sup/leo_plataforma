import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/cards/[id]/installments
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Busca todos os grupos de parcelados ativos para o cartão
    const groups = await prisma.installmentGroup.findMany({
      where: {
        userId: session.user.id,
        cardId: params.id,
      },
      include: {
        transactions: true,
      },
      orderBy: { startDate: "desc" },
    })

    // Normaliza para o contrato esperado pelo frontend
    const result = groups.map((g) => {
      const txs = g.transactions ?? []
      const totalPaid = txs.reduce((sum, t) => sum + Number(t.amount), 0)
      const totalToPay = Number(g.totalValue) - totalPaid
      const currentInstallment = txs.length
      const nextDue = txs[txs.length - 1]?.date ?? g.startDate
      return {
        id: g.id,
        description: g.description,
        totalValue: Number(g.totalValue),
        totalInstallments: g.totalInstallments,
        currentInstallment,
        installmentValue: Number(g.totalValue) / g.totalInstallments,
        totalPaid,
        totalToPay,
        nextDue,
        startDate: g.startDate,
        endDate: txs[txs.length - 1]?.date ?? g.startDate,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching installments:", error)
    return NextResponse.json({ error: "Erro ao buscar parcelados" }, { status: 500 })
  }
}
