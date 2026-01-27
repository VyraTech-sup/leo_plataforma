import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// TODO: Substituir por fetch real dos cartões

import { useEffect, useState } from "react"

type Card = {
  id: string
  name: string
  institution?: string
  limit: number
  used: number
  closeDay: number
  dueDay: number
  status: string
}

export default function CardList({
  onSelect,
  onAdd,
}: {
  onSelect: (id: string) => void
  onAdd: () => void
}) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setCards(data)
      })
      .catch(() => setError("Erro ao buscar cartões"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd}>Novo Cartão</Button>
      </div>
      {loading ? (
        <div>Carregando cartões...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : cards.length === 0 ? (
        <div className="text-muted-foreground">Nenhum cartão encontrado.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Card key={card.id} className="cursor-pointer group" onClick={() => onSelect(card.id)}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{card.name}</CardTitle>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${card.status === "ok" ? "bg-green-100 text-green-800" : card.status === "alert" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                >
                  {card.status === "ok" ? "🟢" : card.status === "alert" ? "🟡" : "🔴"}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">{card.institution}</div>
                <div className="mt-2 flex flex-col gap-1">
                  <div>
                    Limite: <b>R$ {card.limit.toLocaleString()}</b>
                  </div>
                  <div>
                    Utilizado: <b>R$ {card.used.toLocaleString()}</b>
                  </div>
                  <div>
                    Disponível: <b>R$ {(card.limit - card.used).toLocaleString()}</b>
                  </div>
                  <div>Fechamento: dia {card.closeDay}</div>
                  <div>Vencimento: dia {card.dueDay}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
