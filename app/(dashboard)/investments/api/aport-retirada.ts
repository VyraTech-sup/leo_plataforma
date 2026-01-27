import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { investmentId, amount, type, date } = await req.json()
  if (!investmentId || !amount || !type) {
    return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 })
  }
  try {
    const movement = await prisma.investmentMovement.create({
      data: {
        investmentId,
        amount: type === "RETIRADA" ? -Math.abs(amount) : Math.abs(amount),
        type,
        date: date ? new Date(date) : new Date(),
      },
    })

    // Recalcular o valor investido (amount) somando todos os aportes/retiradas
    const allMovements = await prisma.investmentMovement.findMany({
      where: { investmentId },
    })
    const newAmount = allMovements.reduce((sum, m) => sum + Number(m.amount), 0)

    // Atualizar o investimento
    await prisma.investment.update({
      where: { id: investmentId },
      data: { amount: newAmount },
    })

    return NextResponse.json({ success: true, movement })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao registrar movimento." }, { status: 500 })
  }
}
