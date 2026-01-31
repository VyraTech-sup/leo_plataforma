/**
 * POST /api/open-finance/connect
 *
 * Cria um Connect Token do Pluggy para iniciar conexão bancária.
 * O frontend usa este token para abrir o widget do Pluggy.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createConnectToken } from "@/lib/pluggy"

export async function POST(_: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession(authOptions)
    console.log("[OPEN FINANCE CONNECT] Sessão recebida:", session)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Criar Connect Token no Pluggy
    const accessToken = await createConnectToken()

    // 3. Retornar token para o frontend
    return NextResponse.json({
      accessToken,
      // O frontend usará este token para inicializar o Pluggy Connect Widget
    })
  } catch (error) {
    console.error("[API] Error creating connect token:", error)
    return NextResponse.json({ error: "Failed to create connect token" }, { status: 500 })
  }
}
