"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CsvUpload } from "@/components/transactions/csv-upload"
import { CsvPreview } from "@/components/transactions/csv-preview"
import { CsvMapping } from "@/components/transactions/csv-mapping"

// Função utilitária para aplicar o mapeamento do usuário aos dados do CSV
function applyMapping(data: ParsedRow[], mapping: Record<string, string>) {
  return data.map((row) => {
    const mapped: any = {}
    Object.entries(mapping).forEach(([field, csvCol]) => {
      if (csvCol && row[csvCol] !== undefined) {
        mapped[field] = row[csvCol]
      }
    })
    return mapped
  })
}
import { ReviewImport } from "@/components/transactions/review-import"

interface ParsedRow {
  [key: string]: string
}

export default function ImportTransactionsPage() {
  const [csvData, setCsvData] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])

  const [isImporting, setIsImporting] = useState(false)
  const [step, setStep] = useState<"upload" | "preview" | "mapping" | "review" | "confirm">(
    "upload"
  )
  const [reviewData, setReviewData] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const handleFileUpload = (data: ParsedRow[], fileHeaders: string[]) => {
    setCsvData(data)
    setHeaders(fileHeaders)
    setStep("preview")
  }

  const handleReviewConfirm = (data: any[]) => {
    setReviewData(data)
    setStep("confirm")
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      // Remove id temporário antes de enviar
      const mappedTransactions = reviewData.map(({ id, ...rest }) => ({
        ...rest,
        amount: parseFloat(rest.amount || "0"),
      }))
      const response = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: mappedTransactions }),
      })
      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Importação concluída!",
          description: `${result.results.success} transações importadas com sucesso. ${result.results.failed} falharam.`,
        })
        window.dispatchEvent(new CustomEvent("transaction-updated"))
        router.push("/transactions")
      } else {
        throw new Error()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível importar as transações",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/transactions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importar Transações</h1>
          <p className="text-muted-foreground">Importe suas transações de um arquivo CSV</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === "upload" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          1
        </div>
        <span className={step === "upload" ? "font-medium" : "text-muted-foreground"}>Upload</span>
        <div className="h-px w-12 bg-border" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === "preview" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          2
        </div>
        <span className={step === "preview" ? "font-medium" : "text-muted-foreground"}>
          Preview
        </span>
        <div className="h-px w-12 bg-border" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === "mapping" || step === "confirm"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          3
        </div>
        <span
          className={
            step === "mapping" || step === "confirm" ? "font-medium" : "text-muted-foreground"
          }
        >
          Mapeamento
        </span>
        <div className="h-px w-12 bg-border" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          4
        </div>
        <span className={step === "confirm" ? "font-medium" : "text-muted-foreground"}>
          Confirmar
        </span>
      </div>

      {step === "upload" && <CsvUpload onUpload={handleFileUpload} />}

      {step === "preview" && (
        <CsvPreview
          data={csvData}
          onContinue={() => setStep("mapping")}
          onBack={() => setStep("upload")}
        />
      )}

      {step === "mapping" && (
        <CsvMapping
          headers={headers}
          data={csvData}
          onBack={() => setStep("preview")}
          onMapping={(mapping) => {
            setReviewData(applyMapping(csvData, mapping))
            setStep("review")
          }}
        />
      )}

      {step === "review" && (
        <ReviewImport
          transactions={reviewData}
          onConfirm={handleReviewConfirm}
          onBack={() => setStep("mapping")}
        />
      )}

      {step === "confirm" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Confirmar Importação
            </CardTitle>
            <CardDescription>
              Revise e confirme a importação das transações editadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium">{reviewData.length} transações serão importadas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("review")}>
                Voltar
              </Button>
              <Button onClick={handleImport} disabled={isImporting} className="flex-1">
                {isImporting ? (
                  "Importando..."
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar {reviewData.length} Transações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
