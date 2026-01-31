import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Skeleton } from "./ui/skeleton"

interface Connector {
  id: number
  name: string
  imageUrl: string
}

interface Account {
  id: string
  name: string
  balance: number
  currencyCode: string
}

type State = "idle" | "connecting" | "connected" | "loaded" | "error"

export function OpenFinanceConnect() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [selectedConnector, setSelectedConnector] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setState("connecting")
    fetch("/api/pluggy/auth")
      .then(() => fetch("/api/pluggy/connectors"))
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar conectores")
        const data = await res.json()
        setConnectors(data)
        setState("idle")
      })
      .catch((e) => {
        setError(e.message)
        setState("error")
      })
  }, [])

  const handleConnect = async () => {
    if (!selectedConnector) return
    setState("connecting")
    try {
      const res = await fetch("/api/pluggy/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId: selectedConnector, parameters: {} }),
      })
      if (!res.ok) throw new Error("Erro ao conectar")
      const item = await res.json()
      const accountsRes = await fetch(`/api/pluggy/accounts?itemId=${item.id}`)
      const accountsData = await accountsRes.json()
      setAccounts(accountsData)
      setState("connected")
    } catch (e: any) {
      setError(e.message)
      setState("error")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conectar Instituição Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        {state === "error" && <div className="text-red-500">{error}</div>}
        <div className="flex flex-col gap-4">
          <Select onValueChange={(v) => setSelectedConnector(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma instituição" />
            </SelectTrigger>
            <SelectContent>
              {connectors.length === 0 ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                connectors.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <span className="flex items-center gap-2">
                      <img src={c.imageUrl} alt={c.name} className="w-6 h-6 rounded-full" />
                      {c.name}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleConnect} disabled={!selectedConnector || state === "connecting"}>
            {state === "connecting" ? "Conectando..." : "Conectar"}
          </Button>
        </div>
        {state === "connected" && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Contas conectadas</h3>
            <ul className="space-y-2">
              {accounts.map((acc) => (
                <li key={acc.id} className="flex justify-between border-b pb-1">
                  <span>{acc.name}</span>
                  <span>
                    {acc.balance.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: acc.currencyCode,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OpenFinanceConnect
