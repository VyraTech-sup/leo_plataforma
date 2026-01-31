import { NextRequest, NextResponse } from "next/server"
import { getPluggyToken } from "@/lib/pluggy"

export async function GET(req: NextRequest) {
  try {
    const token = await getPluggyToken()
    return NextResponse.json({ token })
  } catch (error: any) {
    console.error("[Pluggy][Auth] Error:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao obter token Pluggy" },
      { status: 500 }
    )
  }
}
