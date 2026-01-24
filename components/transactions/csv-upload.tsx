"use client"

import { useCallback, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet } from "lucide-react"
import Papa from "papaparse"

interface ParsedRow {
  [key: string]: string
}

interface CsvUploadProps {
  onUpload: (data: ParsedRow[], headers: string[]) => void
}

export function CsvUpload({ onUpload }: CsvUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        alert("Por favor, selecione um arquivo CSV")
        return
      }

      setIsProcessing(true)

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || []
          onUpload(results.data as ParsedRow[], headers)
          setIsProcessing(false)
        },
        error: (error) => {
          alert(`Erro ao processar arquivo: ${error.message}`)
          setIsProcessing(false)
        },
      })
    },
    [onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload de Arquivo CSV
        </CardTitle>
        <CardDescription>
          Arraste e solte ou clique para selecionar um arquivo CSV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isProcessing ? (
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Processando arquivo...</p>
            </div>
          ) : (
            <>
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                Arraste seu arquivo CSV aqui
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                ou clique no botão abaixo para selecionar
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <Button asChild>
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Selecionar Arquivo
                </label>
              </Button>
            </>
          )}
        </div>

        <div className="mt-6 space-y-2 rounded-lg bg-muted p-4">
          <h4 className="font-semibold">Formato esperado do CSV:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Primeira linha deve conter os cabeçalhos</li>
            <li>• Colunas recomendadas: tipo, categoria, valor, descrição, data</li>
            <li>• Tipo: INCOME, EXPENSE ou TRANSFER</li>
            <li>• Valor: número decimal (ex: 150.50)</li>
            <li>• Data: formato YYYY-MM-DD (ex: 2024-01-15)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
