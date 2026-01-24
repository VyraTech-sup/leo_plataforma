"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface ContributionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: any
  onSuccess: () => void
}

export function ContributionDialog({ open, onOpenChange, goal, onSuccess }: ContributionDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  })

  useEffect(() => {
    if (open) {
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal) return

    setIsSubmitting(true)

    try {
      const payload = {
        amount: parseFloat(formData.amount || "0"),
        date: new Date(formData.date || new Date()).toISOString(),
        note: formData.note || undefined,
      }

      const response = await fetch(`/api/goals/${goal.id}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Contribuição adicionada!",
          description: `${formatCurrency(payload.amount)} adicionado à meta ${goal.name}`,
        })
        onSuccess()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Ocorreu um erro",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a contribuição",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!goal) return null

  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Contribuição</DialogTitle>
            <DialogDescription>
              Registre um aporte para a meta: <strong>{goal.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-md bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor atual:</span>
                <span className="font-semibold">{formatCurrency(Number(goal.currentAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor alvo:</span>
                <span className="font-semibold">{formatCurrency(Number(goal.targetAmount))}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Falta atingir:</span>
                <span className="font-bold text-primary">{formatCurrency(remaining)}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Valor da Contribuição *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Observação</Label>
              <Textarea
                id="note"
                placeholder="Adicione uma nota (opcional)"
                value={formData.note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adicionando..." : "Adicionar Contribuição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
