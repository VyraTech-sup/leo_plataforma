import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: "ID do investimento ausente." }, { status: 400 })
  try {
    const movements = await prisma.investmentMovement.findMany({
      where: { investmentId: id },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(movements)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar movimentos." }, { status: 500 })
  }
}
