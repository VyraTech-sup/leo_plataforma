"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Brain, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CategoryRule {
  id: string
  pattern: string
  category: string
  matchCount: number
  isActive: boolean
}

export default function CategorizationPage() {
  const [rules, setRules] = useState<CategoryRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPattern, setNewPattern] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const { toast } = useToast()

  const fetchRules = useCallback(async () => {
    try {
      const response = await fetch("/api/categorization/rules")
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as regras",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])
  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPattern || !newCategory) return

    try {
      const response = await fetch("/api/categorization/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern: newPattern, category: newCategory }),
      })

      if (response.ok) {
        toast({
          title: "Regra criada!",
          description: "A regra foi adicionada com sucesso",
        })
        setNewPattern("")
        setNewCategory("")
        fetchRules()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a regra",
        variant: "destructive",
      })
    }
  }

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/categorization/rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchRules()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a regra",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra?")) return

    try {
      const response = await fetch(`/api/categorization/rules/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Regra excluída!",
          description: "A regra foi removida com sucesso",
        })
        fetchRules()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a regra",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categorização Inteligente</h1>
        <p className="text-muted-foreground">Gerencie as regras de categorização automática</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Como Funciona
          </CardTitle>
          <CardDescription>
            O sistema aprende automaticamente quando você categoriza transações. Quando a descrição
            de uma transação contém um padrão conhecido, a categoria é sugerida automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              <strong>Exemplo:</strong> Se você categorizar &quot;Uber&quot; como
              &quot;Transporte&quot;, o sistema irá sugerir &quot;Transporte&quot; sempre que
              encontrar &quot;uber&quot; na descrição.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nova Regra</CardTitle>
          <CardDescription>
            Adicione uma regra manualmente para categorizar futuras transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRule} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="pattern">Padrão (palavra-chave)</Label>
              <Input
                id="pattern"
                placeholder="Ex: uber, ifood, netflix"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Ex: Transporte, Alimentação"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras Ativas</CardTitle>
          <CardDescription>{rules.filter((r) => r.isActive).length} regras ativas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : rules.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhuma regra cadastrada. O sistema irá aprender automaticamente conforme você
              categoriza transações.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Padrão</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-mono">{rule.pattern}</TableCell>
                      <TableCell className="font-medium">{rule.category}</TableCell>
                      <TableCell>{rule.matchCount}x</TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            rule.isActive
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {rule.isActive ? "Ativa" : "Inativa"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleRule(rule.id, rule.isActive)}
                          >
                            {rule.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
