import { NextRequest, NextResponse } from "next/server"
import { getPluggyAccounts, getPluggyTransactions } from "@/lib/pluggy"

// GET: ?itemId=xxx para contas, ?accountId=xxx&from=yyyy-mm-dd&to=yyyy-mm-dd para transações
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get("itemId")
    const accountId = searchParams.get("accountId")
    const from = searchParams.get("from") || undefined
    const to = searchParams.get("to") || undefined

    if (itemId) {
      const accounts = await getPluggyAccounts(itemId)
      return NextResponse.json(accounts)
    }
    if (accountId) {
      const transactions = await getPluggyTransactions(accountId, from, to)
      return NextResponse.json(transactions)
    }
    return NextResponse.json({ error: "itemId ou accountId obrigatório" }, { status: 400 })
  } catch (error: any) {
    console.error("[Pluggy][Accounts][GET] Error:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao buscar contas/transações" },
      { status: 500 }
    )
  }
}
