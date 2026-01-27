"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface TooltipContextType {
  enabled: boolean
  setEnabled: (v: boolean) => void
  seen: Record<string, boolean>
  markSeen: (key: string) => void
  reset: () => void
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined)

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true)
  const [seen, setSeen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      const enabledRaw = localStorage.getItem("tooltips_enabled")
      setEnabled(enabledRaw !== "false")
      const seenRaw = localStorage.getItem("tooltips_seen")
      setSeen(seenRaw ? JSON.parse(seenRaw) : {})
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tooltips_enabled", enabled ? "true" : "false")
    }
  }, [enabled])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tooltips_seen", JSON.stringify(seen))
    }
  }, [seen])

  const markSeen = (key: string) => setSeen((prev) => ({ ...prev, [key]: true }))
  const reset = () => setSeen({})

  return (
    <TooltipContext.Provider value={{ enabled, setEnabled, seen, markSeen, reset }}>
      {children}
    </TooltipContext.Provider>
  )
}

export function useTooltipContext() {
  const ctx = useContext(TooltipContext)
  if (!ctx) throw new Error("useTooltipContext must be used within TooltipProvider")
  return ctx
}
