/**
 * DELETE /api/open-finance/connections/[id]
 *
 * Desconecta e remove uma conexão bancária.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { deleteItem } from "@/lib/pluggy"

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
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

    // 2. Buscar conexão
    const connection = await prisma.bankConnection.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    // 3. Deletar no Pluggy
    try {
      await deleteItem(connection.itemId)
    } catch (error) {
      console.error("Error deleting item from Pluggy:", error)
      // Continuar mesmo se falhar no Pluggy
    }

    // 4. Marcar contas como desconectadas (manter histórico)
    await prisma.account.updateMany({
      where: { connectionId: connection.id },
      data: {
        connectionId: null,
        externalAccountId: null,
      },
    })

    // 5. Deletar conexão
    await prisma.bankConnection.delete({
      where: { id: connection.id },
    })

    return NextResponse.json({
      message: "Connection deleted successfully",
    })
  } catch (error) {
    console.error("[API] Error deleting connection:", error)
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 })
  }
}
