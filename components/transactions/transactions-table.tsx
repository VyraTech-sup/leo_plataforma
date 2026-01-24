"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Edit, Trash2, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react"

interface Transaction {
  id: string
  type: string
  category: string
  amount: string
  description: string
  date: string
  isPending: boolean
  account: { name: string; institution: string } | null
  card: { name: string; brand: string } | null
}

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  pagination: {
    page: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionsTable({
  transactions,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: "Data",
      cell: (info) => formatDate(info.getValue() as string),
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: (info) => {
        const transaction = info.row.original
        return (
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                transaction.type === "INCOME"
                  ? "bg-success/10 text-success"
                  : transaction.type === "EXPENSE"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {transaction.type === "INCOME" ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : transaction.type === "EXPENSE" ? (
                <ArrowDownRight className="h-4 w-4" />
              ) : (
                <ArrowLeftRight className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium">{info.getValue() as string}</p>
              <p className="text-sm text-muted-foreground">{transaction.category}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "account",
      header: "Conta/Cartão",
      cell: (info) => {
        const transaction = info.row.original
        const account = transaction.account
        const card = transaction.card
        if (account) {
          return (
            <div className="text-sm">
              <p className="font-medium">{account.name}</p>
              <p className="text-muted-foreground">{account.institution}</p>
            </div>
          )
        }
        if (card) {
          return (
            <div className="text-sm">
              <p className="font-medium">{card.name}</p>
              <p className="text-muted-foreground">{card.brand}</p>
            </div>
          )
        }
        return <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: (info) => {
        const amount = parseFloat(info.getValue() as string)
        const type = info.row.original.type
        return (
          <span
            className={`font-semibold ${
              type === "INCOME"
                ? "text-success"
                : type === "EXPENSE"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {type === "INCOME" ? "+" : type === "EXPENSE" ? "-" : ""}
            {formatCurrency(amount)}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(info.row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(info.row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
        <p className="text-lg font-medium">Nenhuma transação encontrada</p>
        <p className="text-sm text-muted-foreground">
          Crie sua primeira transação para começar
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}

