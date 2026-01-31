import { NextRequest, NextResponse } from "next/server"
import { createPluggyItem, getPluggyItemStatus } from "@/lib/pluggy"

// POST: Cria novo item (conexão) com connectorId e parâmetros
export async function POST(req: NextRequest) {}

// GET: Obtém status de um item com ?itemId=xxx
export async function GET(req: NextRequest) {
  // Arquivo removido conforme solicitado. Open Finance será refeito do zero.
}
