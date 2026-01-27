import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface AportRetiradaDialogProps {
  onSubmit: (amount: number, type: "APORTE" | "RETIRADA") => void
}

export function AportRetiradaDialog({ onSubmit }: AportRetiradaDialogProps) {
  const [amount, setAmount] = useState(0)
  const [type, setType] = useState<"APORTE" | "RETIRADA">("APORTE")
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Registrar {type === "APORTE" ? "Aporte" : "Retirada"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar {type === "APORTE" ? "Aporte" : "Retirada"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="APORTE">Aporte</option>
            <option value="RETIRADA">Retirada</option>
          </select>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Valor"
          />
          <Button onClick={() => onSubmit(amount, type)} disabled={amount <= 0}>
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
