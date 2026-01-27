import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Endpoint para disparar recálculo global das projeções (dummy, placeholder)
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    // Aqui seria disparado o recálculo real (ex: fila, worker, cache bust)
    // No mock, apenas retorna sucesso imediato
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao recalcular projeções" }, { status: 500 })
  }
}
