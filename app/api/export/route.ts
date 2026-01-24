import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateMonthlyReport, generateAnnualReport } from "@/lib/reports"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { z } from "zod"

const csvExportSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  transactionType: z.string().optional(),
  category: z.string().optional(),
})

const reportExportSchema = z.object({
  reportType: z.enum(["monthly", "annual"]),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100),
  format: z.enum(["excel", "pdf"]),
})
// Função helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Exportar transações como CSV
async function exportTransactionsCSV(
  userId: string,
  filters: {
    startDate?: Date
    endDate?: Date
    type?: string
    category?: string
  }
): Promise<string> {
  const where: any = {
    userId,
  }
  
  if (filters.startDate) where.date = { ...where.date, gte: filters.startDate }
  if (filters.endDate) where.date = { ...where.date, lte: filters.endDate }
  if (filters.type) where.type = filters.type
  if (filters.category) where.category = filters.category

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      account: { select: { name: true } },
      card: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  })

  const csvHeader = "Data,Tipo,Categoria,Descrição,Valor,Conta,Cartão\n"
  const csvRows = transactions
    .map((t) =>
      [
        new Date(t.date).toLocaleDateString("pt-BR"),
        t.type,
        t.category,
        `"${t.description}"`,
        Number(t.amount).toFixed(2),
        t.account?.name || "",
        t.card?.name || "",
      ].join(",")
    )
    .join("\n")

  return csvHeader + csvRows
}

// Exportar relatório como Excel
interface ExportParams {
  month?: number
  year: number
}

async function exportReportExcel(
  userId: string,
  type: "monthly" | "annual",
  params: ExportParams
) {
  const report =
    type === "monthly"
      ? await generateMonthlyReport(userId, params.month!, params.year)
      : await generateAnnualReport(userId, params.year)

  const workbook = XLSX.utils.book_new()

  if (type === "monthly") {
    const monthlyReport = report as any

    // Aba: Resumo
    const summaryData = [
      ["RELATÓRIO MENSAL"],
      [`Período: ${monthlyReport.period.month}/${monthlyReport.period.year}`],
      [""],
      ["Métrica", "Valor"],
      ["Receita Total", formatCurrency(monthlyReport.summary.totalIncome)],
      ["Despesa Total", formatCurrency(monthlyReport.summary.totalExpense)],
      ["Fluxo de Caixa", formatCurrency(monthlyReport.summary.cashFlow)],
      ["Taxa de Poupança", `${monthlyReport.summary.savingsRate.toFixed(2)}%`],
      ["Patrimônio Líquido", formatCurrency(monthlyReport.summary.netWorth)],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo")

    // Aba: Top Categorias
    const categoriesData = [
      ["Categoria", "Valor", "Percentual", "Transações"],
      ...monthlyReport.topCategories.map((c: { category: string; amount: number; percentage: number; count: number }) => [
        c.category,
        c.amount,
        `${c.percentage.toFixed(2)}%`,
        c.count,
      ]),
    ]
    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData)
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categorias")
  } else {
    const annualReport = report as any

    // Aba: Resumo Anual
    const summaryData = [
      ["RELATÓRIO ANUAL"],
      [`Ano: ${annualReport.period.year}`],
      [""],
      ["Métrica", "Valor"],
      ["Receita Total", formatCurrency(annualReport.summary.totalIncome)],
      ["Despesa Total", formatCurrency(annualReport.summary.totalExpense)],
      ["Fluxo de Caixa Total", formatCurrency(annualReport.summary.totalCashFlow)],
      ["Receita Média Mensal", formatCurrency(annualReport.summary.averageMonthlyIncome)],
      ["Despesa Média Mensal", formatCurrency(annualReport.summary.averageMonthlyExpense)],
      ["Taxa de Poupança Anual", `${annualReport.summary.annualSavingsRate.toFixed(2)}%`],
      ["Crescimento Patrimonial", formatCurrency(annualReport.summary.netWorthGrowth)],
      [
        "Crescimento Patrimonial (%)",
        `${annualReport.summary.netWorthGrowthPercentage.toFixed(2)}%`,
      ],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo")

    // Aba: Comparação Mensal
    const monthlyData = [
      ["Mês", "Receita", "Despesa", "Fluxo de Caixa", "Taxa de Poupança"],
      ...annualReport.monthlyComparison.map((m: { month: string; income: number; expense: number; cashFlow: number; savingsRate: number }) => [
        m.month,
        m.income,
        m.expense,
        m.cashFlow,
        `${m.savingsRate.toFixed(2)}%`,
      ]),
    ]
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData)
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Mês a Mês")

    // Aba: Top Categorias
    const categoriesData = [
      ["Categoria", "Valor Total", "Percentual"],
      ...annualReport.topCategories.map((c: { category: string; amount: number; percentage: number }) => [
        c.category,
        c.amount,
        `${c.percentage.toFixed(2)}%`,
      ]),
    ]
    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData)
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categorias")

    // Aba: Metas
    if (annualReport.goalsProgress.length > 0) {
      const goalsData = [
        ["Meta", "Valor Alvo", "Valor Atual", "Progresso", "Status"],
        ...annualReport.goalsProgress.map((g: { name: string; targetAmount: number; currentAmount: number; progress: number; status: string }) => [
          g.name,
          g.targetAmount,
          g.currentAmount,
          `${g.progress.toFixed(2)}%`,
          g.status,
        ]),
      ]
      const goalsSheet = XLSX.utils.aoa_to_sheet(goalsData)
      XLSX.utils.book_append_sheet(workbook, goalsSheet, "Metas")
    }
  }

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
}

// Exportar relatório como PDF
async function exportReportPDF(
  userId: string,
  type: "monthly" | "annual",
  params: ExportParams
): Promise<Buffer> {
  const report =
    type === "monthly"
      ? await generateMonthlyReport(userId, params.month!, params.year)
      : await generateAnnualReport(userId, params.year)

  const doc = new jsPDF()

  // Configurações
  const primaryColor: [number, number, number] = [59, 130, 246] // blue-500
  const textColor: [number, number, number] = [17, 24, 39] // gray-900

  if (type === "monthly") {
    const monthlyReport = report as any

    // Cabeçalho
    doc.setFontSize(20)
    doc.setTextColor(...textColor)
    doc.text("Relatório Mensal", 14, 20)

    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `${monthlyReport.period.month} de ${monthlyReport.period.year}`,
      14,
      28
    )

    // Resumo Financeiro
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("Resumo Financeiro", 14, 42)

    const summaryData = [
      ["Receita Total", formatCurrency(monthlyReport.summary.totalIncome)],
      ["Despesa Total", formatCurrency(monthlyReport.summary.totalExpense)],
      ["Fluxo de Caixa", formatCurrency(monthlyReport.summary.cashFlow)],
      ["Taxa de Poupança", `${monthlyReport.summary.savingsRate.toFixed(2)}%`],
      ["Patrimônio Líquido", formatCurrency(monthlyReport.summary.netWorth)],
    ]

    autoTable(doc, {
      startY: 48,
      head: [["Métrica", "Valor"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: primaryColor },
    })

    // Top Categorias
    if (monthlyReport.topCategories.length > 0) {
      const lastY = (doc as any).lastAutoTable.finalY || 48
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text("Top 5 Categorias de Despesa", 14, lastY + 10)

      const categoriesData = monthlyReport.topCategories.map((c: { category: string; amount: number; percentage: number; count: number }) => [
        c.category,
        formatCurrency(c.amount),
        `${c.percentage.toFixed(1)}%`,
        c.count.toString(),
      ])

      autoTable(doc, {
        startY: lastY + 16,
        head: [["Categoria", "Valor", "%", "Transações"]],
        body: categoriesData,
        theme: "striped",
        headStyles: { fillColor: primaryColor },
      })
    }

    // Insights
    if (monthlyReport.insights.length > 0) {
      const lastY = (doc as any).lastAutoTable.finalY || 100
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text("Insights", 14, lastY + 10)

      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      monthlyReport.insights.forEach((insight: string, i: number) => {
        doc.text(`• ${insight}`, 14, lastY + 18 + i * 6)
      })
    }
  } else {
    const annualReport = report as any

    // Cabeçalho
    doc.setFontSize(20)
    doc.setTextColor(...textColor)
    doc.text("Relatório Anual", 14, 20)

    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Ano ${annualReport.period.year}`, 14, 28)

    // Resumo
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("Resumo Anual", 14, 42)

    const summaryData = [
      ["Receita Total", formatCurrency(annualReport.summary.totalIncome)],
      ["Despesa Total", formatCurrency(annualReport.summary.totalExpense)],
      ["Fluxo de Caixa Total", formatCurrency(annualReport.summary.totalCashFlow)],
      ["Receita Média Mensal", formatCurrency(annualReport.summary.averageMonthlyIncome)],
      ["Despesa Média Mensal", formatCurrency(annualReport.summary.averageMonthlyExpense)],
      ["Taxa de Poupança Anual", `${annualReport.summary.annualSavingsRate.toFixed(2)}%`],
      ["Crescimento Patrimonial", formatCurrency(annualReport.summary.netWorthGrowth)],
      [
        "Crescimento Patrimonial (%)",
        `${annualReport.summary.netWorthGrowthPercentage.toFixed(2)}%`,
      ],
    ]

    autoTable(doc, {
      startY: 48,
      head: [["Métrica", "Valor"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: primaryColor },
    })

    // Melhor e pior mês
    const performanceY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text("Performance", 14, performanceY)

    const performanceData = [
      [
        "Melhor Mês",
        annualReport.bestMonth.month,
        formatCurrency(annualReport.bestMonth.cashFlow),
      ],
      [
        "Pior Mês",
        annualReport.worstMonth.month,
        formatCurrency(annualReport.worstMonth.cashFlow),
      ],
    ]

    autoTable(doc, {
      startY: performanceY + 6,
      head: [["Indicador", "Mês", "Fluxo de Caixa"]],
      body: performanceData,
      theme: "striped",
      headStyles: { fillColor: primaryColor },
    })

    // Top Categorias
    if (annualReport.topCategories.length > 0) {
      const categoriesY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text("Top 5 Categorias do Ano", 14, categoriesY)

      const categoriesData = annualReport.topCategories.map((c: { category: string; amount: number; percentage: number }) => [
        c.category,
        formatCurrency(c.amount),
        `${c.percentage.toFixed(1)}%`,
      ])

      autoTable(doc, {
        startY: categoriesY + 6,
        head: [["Categoria", "Valor Total", "%"]],
        body: categoriesData,
        theme: "striped",
        headStyles: { fillColor: primaryColor },
      })
    }
  }

  // Rodapé
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} - Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  return Buffer.from(doc.output("arraybuffer"))
}

// API Route Handler
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const type = searchParams.get("type") || "transactions"

    if (type === "transactions") {
      const exportData = {
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        transactionType: searchParams.get("transactionType") || undefined,
        category: searchParams.get("category") || undefined,
      }

      const validated = csvExportSchema.parse(exportData)

      const csv = await exportTransactionsCSV(session.user.id, {
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        type: validated.transactionType,
        category: validated.category,
      })

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="transacoes_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (type === "report") {
      const exportData = {
        reportType: (searchParams.get("reportType") || "monthly") as "monthly" | "annual",
        month: searchParams.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth() + 1,
        year: searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear(),
        format: format as "excel" | "pdf",
      }

      const validated = reportExportSchema.parse(exportData)

      if (validated.format === "excel") {
        const buffer = await exportReportExcel(
          session.user.id,
          validated.reportType,
          { month: validated.month, year: validated.year }
        )

        const filename =
          validated.reportType === "monthly"
            ? `relatorio_mensal_${validated.month}_${validated.year}.xlsx`
            : `relatorio_anual_${validated.year}.xlsx`

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        })
      } else if (validated.format === "pdf") {
        const buffer = await exportReportPDF(
          session.user.id,
          validated.reportType,
          { month: validated.month, year: validated.year }
        )

        const filename =
          validated.reportType === "monthly"
            ? `relatorio_mensal_${validated.month}_${validated.year}.pdf`
            : `relatorio_anual_${validated.year}.pdf`

        return new NextResponse(Buffer.from(buffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        })
      }
    }

    return NextResponse.json({ error: "Formato de exportação inválido" }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Erro ao exportar dados:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
