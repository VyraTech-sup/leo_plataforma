import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    })

    const categories = transactions.map((t: { category: string }) => t.category).filter(Boolean)

    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 })
  }
}
