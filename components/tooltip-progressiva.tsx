"use client"
import { useTooltipContext } from "@/components/tooltip-context"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface TooltipProgressivaProps {
  id: string // ex: "dashboard", "budget_edit"
  text: string
  cta?: string
  placement?: "top" | "bottom" | "left" | "right"
  children?: React.ReactNode // Optional: anchor element
}

export function TooltipProgressiva({
  id,
  text,
  cta = "Entendi",
  placement = "top",
  children,
}: TooltipProgressivaProps) {
  const { enabled, seen, markSeen } = useTooltipContext()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (enabled && !seen[id]) {
      setOpen(true)
    }
  }, [enabled, seen, id])

  if (!enabled || seen[id]) return children || null

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {children}
      {open && (
        <div
          className={`z-50 absolute ${placement === "top" ? "-top-2 left-1/2 -translate-x-1/2 -translate-y-full" : ""} ${placement === "bottom" ? "-bottom-2 left-1/2 -translate-x-1/2 translate-y-full" : ""} ${placement === "left" ? "left-0 -translate-x-full top-1/2 -translate-y-1/2" : ""} ${placement === "right" ? "right-0 translate-x-full top-1/2 -translate-y-1/2" : ""} bg-primary text-primary-foreground rounded shadow-lg p-3 min-w-[220px] max-w-xs`}
          style={{ pointerEvents: "auto" }}
        >
          <div className="mb-2 text-sm font-medium">{text}</div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setOpen(false)
              markSeen(id)
            }}
          >
            {cta}
          </Button>
        </div>
      )}
    </div>
  )
}
