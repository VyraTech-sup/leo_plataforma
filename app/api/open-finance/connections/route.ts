/**
 * GET /api/open-finance/connections
 *
 * Lista todas as conexões bancárias do usuário autenticado.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(_: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 2. Buscar conexões com contas
    const connections = await prisma.bankConnection.findMany({
      where: { userId: user.id },
      include: {
        accounts: {
          select: {
            id: true,
            name: true,
            institution: true,
            balance: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ connections })
  } catch (error) {
    console.error("[API] Error fetching connections:", error)
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 })
  }
}
