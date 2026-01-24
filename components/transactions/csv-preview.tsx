"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSearch } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ParsedRow {
  [key: string]: string
}

interface CsvPreviewProps {
  data: ParsedRow[]
  onContinue: () => void
  onBack: () => void
}

export function CsvPreview({ data, onContinue, onBack }: CsvPreviewProps) {
  const headers = data.length > 0 && data[0] ? Object.keys(data[0]) : []
  const previewData = data.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="h-5 w-5" />
          Preview do Arquivo
        </CardTitle>
        <CardDescription>
          Revise as primeiras {previewData.length} linhas de {data.length} total
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={header}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium">
            {data.length} linhas encontradas
          </p>
          <p className="text-sm text-muted-foreground">
            {headers.length} colunas identificadas
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button onClick={onContinue} className="flex-1">
            Continuar para Mapeamento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
