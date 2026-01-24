"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface Account {
  id: string
  name: string
}

interface TransactionFiltersProps {
  filters: {
    search: string
    category: string
    accountId: string
    type: string
    startDate: string
    endDate: string
  }
  onFiltersChange: (filters: TransactionFiltersProps["filters"]) => void
}

const COMMON_CATEGORIES = [
  "Salário",
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Investimento",
  "Outros",
]

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<string[]>(COMMON_CATEGORIES)

  useEffect(() => {
    fetchAccounts()
    fetchCategories()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/transactions/categories")
      if (response.ok) {
        const data = await response.json()
        const uniqueCategories = Array.from(
          new Set([...COMMON_CATEGORIES, ...data.categories])
        )
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      category: "",
      accountId: "",
      type: "",
      startDate: "",
      endDate: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Descrição..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={filters.category || "ALL"}
            onValueChange={(value) => onFiltersChange({ ...filters, category: value === "ALL" ? "" : value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">Conta</Label>
          <Select
            value={filters.accountId || "ALL"}
            onValueChange={(value) => onFiltersChange({ ...filters, accountId: value === "ALL" ? "" : value })}
          >
            <SelectTrigger id="account">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={filters.type || "ALL"}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value === "ALL" ? "" : value })}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="INCOME">Receita</SelectItem>
              <SelectItem value="EXPENSE">Despesa</SelectItem>
              <SelectItem value="TRANSFER">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Data Início</Label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Data Fim</Label>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
          />
        </div>

        <div className="flex items-end">
          {hasActiveFilters && (
            <Button variant="outline" className="w-full" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
