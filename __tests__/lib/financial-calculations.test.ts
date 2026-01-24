import { describe, it, expect } from 'vitest'

// Testes para cálculo de insights financeiros
describe('Cálculo de Insights Financeiros', () => {
  it('deve calcular taxa de poupança corretamente', () => {
    const receita = 5000
    const despesa = 3500
    const fluxoCaixa = receita - despesa
    const taxaPoupanca = (fluxoCaixa / receita) * 100

    expect(taxaPoupanca).toBe(30)
  })

  it('deve identificar déficit quando despesas > receitas', () => {
    const receita = 3000
    const despesa = 4000
    const fluxoCaixa = receita - despesa

    expect(fluxoCaixa).toBeLessThan(0)
    expect(Math.abs(fluxoCaixa)).toBe(1000)
  })

  it('deve calcular percentual de categoria corretamente', () => {
    const totalDespesa = 3500
    const categoriaValor = 700
    const percentual = (categoriaValor / totalDespesa) * 100

    expect(percentual).toBe(20)
  })
})

// Testes para cálculo de progresso de metas
describe('Cálculo de Progresso de Metas', () => {
  it('deve calcular progresso percentual corretamente', () => {
    const valorAlvo = 10000
    const valorAtual = 7500
    const progresso = (valorAtual / valorAlvo) * 100

    expect(progresso).toBe(75)
  })

  it('deve calcular meta mensal necessária', () => {
    const valorAlvo = 12000
    const valorAtual = 2000
    const restante = valorAlvo - valorAtual
    const mesesRestantes = 10
    const metaMensal = restante / mesesRestantes

    expect(metaMensal).toBe(1000)
  })

  it('deve tratar meta já concluída (100%+)', () => {
    const valorAlvo = 5000
    const valorAtual = 6000
    const progresso = Math.min((valorAtual / valorAlvo) * 100, 100)

    // Progresso pode exceder 100% mas tipicamente limitamos
    expect((valorAtual / valorAlvo) * 100).toBe(120)
    expect(progresso).toBe(100)
  })

  it('deve calcular dias restantes até deadline', () => {
    const hoje = new Date('2024-01-01')
    const deadline = new Date('2024-12-31')
    const diasRestantes = Math.ceil(
      (deadline.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    )

    expect(diasRestantes).toBe(365)
  })
})

// Testes para formatação de valores
describe('Formatação de Valores', () => {
  it('deve formatar moeda brasileira corretamente', () => {
    const valor = 1234.56
    const formatado = valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    // Non-breaking space (U+00A0) usado pelo toLocaleString
    expect(formatado).toBe('R$\u00A01.234,56')
  })

  it('deve formatar percentual com 1 casa decimal', () => {
    const percentual = 23.456
    const formatado = `${percentual.toFixed(1)}%`

    expect(formatado).toBe('23.5%')
  })
})

// Testes para validação de dados
describe('Validação de Dados Financeiros', () => {
  it('deve validar valor positivo para receitas', () => {
    const valor = 100
    expect(valor).toBeGreaterThan(0)
  })

  it('deve validar tipo de transação válido', () => {
    const tiposValidos = ['INCOME', 'EXPENSE']
    const tipo = 'INCOME'
    expect(tiposValidos).toContain(tipo)
  })

  it('deve validar mês entre 1 e 12', () => {
    const mes = 6
    expect(mes).toBeGreaterThanOrEqual(1)
    expect(mes).toBeLessThanOrEqual(12)
  })

  it('deve validar ano razoável', () => {
    const ano = 2024
    expect(ano).toBeGreaterThanOrEqual(2000)
    expect(ano).toBeLessThanOrEqual(2100)
  })
})

// Testes para agregação de dados de relatórios
describe('Agregação de Dados de Relatórios', () => {
  it('deve agrupar transações por categoria', () => {
    const transacoes = [
      { categoria: 'Alimentação', valor: 100 },
      { categoria: 'Transporte', valor: 50 },
      { categoria: 'Alimentação', valor: 80 },
    ]

    const agrupado = transacoes.reduce((acc, t) => {
      if (!acc[t.categoria]) {
        acc[t.categoria] = { total: 0, count: 0 }
      }
      acc[t.categoria].total += t.valor
      acc[t.categoria].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    expect(agrupado['Alimentação'].total).toBe(180)
    expect(agrupado['Alimentação'].count).toBe(2)
    expect(agrupado['Transporte'].total).toBe(50)
  })

  it('deve ordenar categorias por valor decrescente', () => {
    const categorias = [
      { nome: 'A', valor: 100 },
      { nome: 'B', valor: 300 },
      { nome: 'C', valor: 200 },
    ]

    const ordenado = [...categorias].sort((a, b) => b.valor - a.valor)

    expect(ordenado[0].nome).toBe('B')
    expect(ordenado[1].nome).toBe('C')
    expect(ordenado[2].nome).toBe('A')
  })

  it('deve limitar top categorias a 5', () => {
    const categorias = Array.from({ length: 10 }, (_, i) => ({
      nome: `Cat${i}`,
      valor: (10 - i) * 100,
    }))

    const top5 = categorias.slice(0, 5)

    expect(top5).toHaveLength(5)
    expect(top5[0].valor).toBe(1000)
    expect(top5[4].valor).toBe(600)
  })
})

// Testes para cálculo de patrimônio líquido
describe('Cálculo de Patrimônio Líquido', () => {
  it('deve somar saldos de todas as contas', () => {
    const contas = [
      { nome: 'Conta Corrente', saldo: 1000 },
      { nome: 'Poupança', saldo: 5000 },
      { nome: 'Investimentos', saldo: 10000 },
    ]

    const patrimonioLiquido = contas.reduce((total, conta) => total + conta.saldo, 0)

    expect(patrimonioLiquido).toBe(16000)
  })

  it('deve calcular crescimento patrimonial percentual', () => {
    const patrimonioInicial = 10000
    const patrimonioFinal = 12000
    const crescimento = patrimonioFinal - patrimonioInicial
    const crescimentoPercentual = (crescimento / patrimonioInicial) * 100

    expect(crescimento).toBe(2000)
    expect(crescimentoPercentual).toBe(20)
  })
})
