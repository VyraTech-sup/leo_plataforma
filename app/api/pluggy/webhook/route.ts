import { NextRequest, NextResponse } from "next/server"
import { validatePluggyWebhookSignature } from "@/lib/pluggy"

const WEBHOOK_SECRET = process.env.PLUGGY_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-pluggy-signature") || ""
    const rawBody = await req.text()
    if (!validatePluggyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.warn("[Pluggy][Webhook] Assinatura inválida")
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
    }
    const event = JSON.parse(rawBody)
    // Log de eventos Pluggy
    console.log("[Pluggy][Webhook] Evento recebido:", event.event, event)
    // Aqui pode-se integrar com o banco de dados ou fila
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[Pluggy][Webhook][POST] Error:", error)
    return NextResponse.json({ error: error.message || "Erro no webhook Pluggy" }, { status: 500 })
  }
}
