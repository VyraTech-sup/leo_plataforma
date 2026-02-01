"use client"

import React from "react"
import { TrendingUp, DollarSign, TrendingDown, ArrowRightLeft } from "lucide-react"

export interface StatsProps {
  netWorth: number
  monthIncome: number
  monthExpense: number
  cashFlow: number
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function DashboardStats({ netWorth, monthIncome, monthExpense, cashFlow }: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Patrimônio Líquido */}
      <div className="bg-[#18181b] border-2 border-teal-500 rounded-lg p-4 flex flex-col gap-2 min-h-[110px] border-teal-500">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Patrimônio Líquido</span>
          <TrendingUp className="text-teal-400" size={24} />
        </div>
        <span className="text-2xl font-bold text-white">{formatCurrency(netWorth)}</span>
        <span className="text-xs text-teal-400 flex items-center gap-1">↑ TrendingUp</span>
      </div>
      {/* Receita do Mês */}
      <div className="bg-[#18181b] border-2 border-green-500 rounded-lg p-4 flex flex-col gap-2 min-h-[110px] border-green-500">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Receita do Mês</span>
          <DollarSign className="text-green-400" size={24} />
        </div>
        <span className="text-2xl font-bold text-green-500">{formatCurrency(monthIncome)}</span>
        <span className="text-xs text-green-400 flex items-center gap-1">↑ TrendingUp</span>
      </div>
      {/* Despesa do Mês */}
      <div className="bg-[#18181b] border-2 border-red-500 rounded-lg p-4 flex flex-col gap-2 min-h-[110px] border-red-500">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Despesa do Mês</span>
          <TrendingDown className="text-red-400" size={24} />
        </div>
        <span className="text-2xl font-bold text-red-500">{formatCurrency(monthExpense)}</span>
        <span className="text-xs text-red-400 flex items-center gap-1">↓ TrendingDown</span>
      </div>
      {/* Fluxo de Caixa */}
      <div className="bg-[#18181b] border-2 border-blue-500 rounded-lg p-4 flex flex-col gap-2 min-h-[110px] border-blue-500">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Fluxo de Caixa</span>
          <ArrowRightLeft className="text-blue-400" size={24} />
        </div>
        <span className="text-2xl font-bold text-blue-500">{formatCurrency(cashFlow)}</span>
        <span className="text-xs text-blue-400 flex items-center gap-1">→ Fluxo</span>
      </div>
    </div>
  )
}
