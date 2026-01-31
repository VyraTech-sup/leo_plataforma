import { NextRequest, NextResponse } from "next/server"
import { listPluggyConnectors } from "@/lib/pluggy"

export async function GET(req: NextRequest) {
  try {
    const connectors = await listPluggyConnectors()
    return NextResponse.json(connectors)
  } catch (error: any) {
    console.error("[Pluggy][Connectors][GET] Error:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar conectores" },
      { status: 500 }
    )
  }
}
