"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Transaction {
  id: string
  date: Date | string
  description: string
  category?: string | null
  type: string
  amount: number
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const defaultTransactions = [
    {
      id: "1",
      date: new Date("2026-02-05"),
      description: "Salário",
      category: "Receita",
      type: "INCOME",
      amount: 4500,
    },
    {
      id: "2",
      date: new Date("2026-02-07"),
      description: "Supermercado",
      category: "Alimentação",
      type: "EXPENSE",
      amount: 350,
    },
    {
      id: "3",
      date: new Date("2026-02-10"),
      description: "Uber",
      category: "Transporte",
      type: "EXPENSE",
      amount: 55,
    },
    {
      id: "4",
      date: new Date("2026-02-12"),
      description: "Aluguel",
      category: "Despesa",
      type: "EXPENSE",
      amount: 1800,
    },
    {
      id: "5",
      date: new Date("2026-02-15"),
      description: "Cinema",
      category: "Lazer",
      type: "EXPENSE",
      amount: 120,
    },
  ]

  const displayTransactions = transactions.length > 0 ? transactions : defaultTransactions

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <Card className="bg-[#18181b] border-2 border-teal-500 rounded-lg shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900">
              <TableHead className="text-gray-400">Data</TableHead>
              <TableHead className="text-gray-400">Descrição</TableHead>
              <TableHead className="text-gray-400">Categoria</TableHead>
              <TableHead className="text-gray-400">Tipo</TableHead>
              <TableHead className="text-right text-gray-400">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTransactions.slice(0, 5).map((transaction, index) => (
              <TableRow
                key={transaction.id}
                className={`border-gray-800 ${
                  index % 2 === 0 ? "bg-gray-950" : "bg-black"
                } hover:bg-gray-900`}
              >
                <TableCell className="text-gray-300">{formatDate(transaction.date)}</TableCell>
                <TableCell className="text-white font-medium">{transaction.description}</TableCell>
                <TableCell className="text-gray-400">
                  {transaction.category || "Sem categoria"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === "INCOME"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "Crédito" : "Débito"}
                  </span>
                </TableCell>
                <TableCell
                  className={`text-right font-bold ${
                    transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
