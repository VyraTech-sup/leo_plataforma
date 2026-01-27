"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, Check, X } from "lucide-react"

interface ReviewTransaction {
  id: string
  type: string
  category: string
  subcategory?: string
  amount: string
  description: string
  date: string
  accountId?: string
}

interface ReviewImportProps {
  transactions: ReviewTransaction[]
  onConfirm: (data: ReviewTransaction[]) => void
  onBack: () => void
}

export function ReviewImport({ transactions, onConfirm, onBack }: ReviewImportProps) {
  const [data, setData] = useState(transactions)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<ReviewTransaction>>({})

  const handleEdit = (id: string) => {
    setEditingId(id)
    setEditValues(data.find((t) => t.id === id) || {})
  }

  const handleSave = (id: string) => {
    setData((d) => d.map((t) => (t.id === id ? { ...t, ...editValues } : t)))
    setEditingId(null)
    setEditValues({})
  }

  const handleDelete = (id: string) => {
    setData((d) => d.filter((t) => t.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisar Transações Importadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[500px] rounded-md border mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Subcategoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((t) => {
                const isEditing = editingId === t.id
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      {isEditing ? (
                        <select
                          className="border rounded px-1 py-0.5 text-xs"
                          value={editValues.type ?? t.type}
                          onChange={(e) => setEditValues((v) => ({ ...v, type: e.target.value }))}
                        >
                          <option value="INCOME">Receita</option>
                          <option value="EXPENSE">Despesa</option>
                          <option value="TRANSFER">Transferência</option>
                        </select>
                      ) : (
                        t.type
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border rounded px-1 py-0.5 text-xs"
                          value={editValues.category ?? t.category}
                          onChange={(e) =>
                            setEditValues((v) => ({ ...v, category: e.target.value }))
                          }
                        />
                      ) : (
                        t.category
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border rounded px-1 py-0.5 text-xs"
                          value={editValues.subcategory ?? t.subcategory ?? ""}
                          onChange={(e) =>
                            setEditValues((v) => ({ ...v, subcategory: e.target.value }))
                          }
                        />
                      ) : (
                        t.subcategory || "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border rounded px-1 py-0.5 text-xs w-20"
                          type="number"
                          step="0.01"
                          value={editValues.amount ?? t.amount}
                          onChange={(e) => setEditValues((v) => ({ ...v, amount: e.target.value }))}
                        />
                      ) : (
                        t.amount
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border rounded px-1 py-0.5 text-xs w-40"
                          value={editValues.description ?? t.description}
                          onChange={(e) =>
                            setEditValues((v) => ({ ...v, description: e.target.value }))
                          }
                        />
                      ) : (
                        t.description
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border rounded px-1 py-0.5 text-xs w-28"
                          type="date"
                          value={editValues.date ?? t.date}
                          onChange={(e) => setEditValues((v) => ({ ...v, date: e.target.value }))}
                        />
                      ) : (
                        t.date
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border rounded px-1 py-0.5 text-xs w-24"
                          value={editValues.accountId ?? t.accountId ?? ""}
                          onChange={(e) =>
                            setEditValues((v) => ({ ...v, accountId: e.target.value }))
                          }
                        />
                      ) : (
                        t.accountId || "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleSave(t.id)}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(t.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button onClick={() => onConfirm(data)} className="flex-1">
            Confirmar Importação
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
