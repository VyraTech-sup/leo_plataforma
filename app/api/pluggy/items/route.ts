import { NextRequest, NextResponse } from "next/server"
import { createPluggyItem, getPluggyItemStatus } from "@/lib/pluggy"

// POST: Cria novo item (conexão) com connectorId e parâmetros
export async function POST(req: NextRequest) {
  try {
    const { connectorId, parameters } = await req.json()
    if (!connectorId || typeof connectorId !== "number") {
      return NextResponse.json({ error: "connectorId obrigatório" }, { status: 400 })
    }
    const item = await createPluggyItem(connectorId, parameters || {})
    return NextResponse.json(item)
  } catch (error: any) {
    console.error("[Pluggy][Items][POST] Error:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao criar item Pluggy" },
      { status: 500 }
    )
  }
}

// GET: Obtém status de um item com ?itemId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get("itemId")
    if (!itemId) {
      return NextResponse.json({ error: "itemId obrigatório" }, { status: 400 })
    }
    const status = await getPluggyItemStatus(itemId)
    return NextResponse.json(status)
  } catch (error: any) {
    console.error("[Pluggy][Items][GET] Error:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao obter status do item" },
      { status: 500 }
    )
  }
}
