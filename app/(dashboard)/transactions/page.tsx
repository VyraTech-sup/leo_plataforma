"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Receipt } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TransactionsSkeleton } from "@/components/ui/loading-skeletons"
import { EmptyState } from "@/components/ui/empty-state"
import dynamic from "next/dynamic"

// Lazy load do TransactionDialog para melhorar performance
const TransactionDialog = dynamic(
  () =>
    import("@/components/transactions/transaction-dialog").then((mod) => ({
      default: mod.TransactionDialog,
    })),
  { ssr: false }
)

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

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    accountId: "",
    type: "",
    startDate: "",
    endDate: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchTransactions()
  }, [pagination.page, filters])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "")),
      })

      const response = await fetch(`/api/transactions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
        setPagination(data.pagination)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return

    try {
      const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Transação excluída!", description: "A transação foi removida com sucesso" })

        // Disparar evento para atualizar o dashboard
        window.dispatchEvent(new CustomEvent("transaction-updated"))

        fetchTransactions()
      } else {
        throw new Error()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação",
        variant: "destructive",
      })
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
    fetchTransactions()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
          <p className="text-muted-foreground">Gerencie todas as suas movimentações financeiras</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/transactions/import")}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <TransactionsSkeleton />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma transação encontrada"
          description="Comece registrando suas primeiras movimentações financeiras ou importe um arquivo CSV com suas transações."
          action={{
            label: "Nova Transação",
            onClick: () => setIsDialogOpen(true),
          }}
        />
      ) : (
        <TransactionsTable
          transactions={transactions}
          isLoading={false}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingTransaction(null)
        }}
        transaction={editingTransaction}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
