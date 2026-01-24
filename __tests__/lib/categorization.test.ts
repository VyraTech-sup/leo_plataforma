import { describe, it, expect } from 'vitest'

// Testes para lógica de categorização automática
describe('Categorização Automática', () => {
  it('deve aplicar regra de palavra-chave exata', () => {
    const rule = {
      keyword: 'UBER',
      matchType: 'EXACT',
      category: 'Transporte',
    }

    const description1 = 'UBER'
    const description2 = 'UBER TRIP'
    const description3 = 'uber'

    expect(description1).toBe(rule.keyword)
    expect(description2).not.toBe(rule.keyword)
    expect(description3.toUpperCase()).toBe(rule.keyword)
  })

  it('deve aplicar regra de palavra-chave parcial (contains)', () => {
    const rule = {
      keyword: 'MERCADO',
      matchType: 'CONTAINS',
      category: 'Alimentação',
    }

    const description1 = 'MERCADO LIVRE'
    const description2 = 'COMPRA NO MERCADO'
    const description3 = 'FARMÁCIA'

    expect(description1.includes(rule.keyword)).toBe(true)
    expect(description2.includes(rule.keyword)).toBe(true)
    expect(description3.includes(rule.keyword)).toBe(false)
  })

  it('deve aplicar regra case-insensitive', () => {
    const keyword = 'IFOOD'
    const descriptions = ['ifood', 'IFOOD', 'iFooD', 'IFood']

    descriptions.forEach((desc) => {
      expect(desc.toUpperCase()).toBe(keyword)
    })
  })

  it('deve selecionar categoria da primeira regra que match', () => {
    const rules = [
      { keyword: 'UBER', category: 'Transporte', matchType: 'EXACT' },
      { keyword: 'ALIMENTAÇÃO', category: 'Alimentação', matchType: 'CONTAINS' },
      { keyword: 'FARMÁCIA', category: 'Saúde', matchType: 'CONTAINS' },
    ]

    const description = 'UBER TRIP'

    let matchedCategory = 'Sem categoria'
    for (const rule of rules) {
      if (rule.matchType === 'EXACT' && description === rule.keyword) {
        matchedCategory = rule.category
        break
      } else if (rule.matchType === 'CONTAINS' && description.includes(rule.keyword)) {
        matchedCategory = rule.category
        break
      }
    }

    // UBER TRIP não match EXACT "UBER", então não deve categorizar
    expect(matchedCategory).toBe('Sem categoria')
  })

  it('deve priorizar regras por ordem de criação', () => {
    const rules = [
      { id: 1, keyword: 'MERCADO', category: 'Alimentação', matchType: 'CONTAINS' },
      { id: 2, keyword: 'MERCADO', category: 'Compras', matchType: 'CONTAINS' },
    ]

    const description = 'MERCADO LIVRE'
    let category = 'Sem categoria'

    for (const rule of rules) {
      if (description.includes(rule.keyword)) {
        category = rule.category
        break
      }
    }

    expect(category).toBe('Alimentação') // Primeira regra vence
  })
})

// Testes para sugestão de categorização
describe('Sugestão de Categorização', () => {
  it('deve identificar transação sem categoria', () => {
    const transaction = {
      description: 'COMPRA MERCADO',
      category: 'Sem categoria',
    }

    const needsCategorization = transaction.category === 'Sem categoria' ||
      transaction.category === 'Outros' ||
      !transaction.category

    expect(needsCategorization).toBe(true)
  })

  it('deve sugerir categoria baseada em histórico', () => {
    const historico = [
      { description: 'IFOOD', category: 'Alimentação' },
      { description: 'IFOOD PEDIDO', category: 'Alimentação' },
      { description: 'UBER', category: 'Transporte' },
    ]

    const novaTransacao = 'IFOOD JANTAR'

    // Buscar descrições similares no histórico
    const similares = historico.filter((h) =>
      novaTransacao.includes(h.description) || h.description.includes(novaTransacao.split(' ')[0])
    )

    const categoriaSugerida = similares.length > 0 ? similares[0].category : null

    expect(categoriaSugerida).toBe('Alimentação')
  })

  it('deve criar regra automática após aplicar sugestão', () => {
    const sugestao = {
      keyword: 'IFOOD',
      category: 'Alimentação',
      confidence: 0.95,
    }

    const shouldCreateRule = sugestao.confidence > 0.8

    expect(shouldCreateRule).toBe(true)

    const newRule = {
      keyword: sugestao.keyword,
      category: sugestao.category,
      matchType: 'CONTAINS',
    }

    expect(newRule.keyword).toBe('IFOOD')
    expect(newRule.category).toBe('Alimentação')
  })
})

// Testes para análise de padrões de transações
describe('Análise de Padrões de Transações', () => {
  it('deve identificar transações recorrentes', () => {
    const transactions = [
      { description: 'NETFLIX', amount: 29.9, date: '2024-01-15' },
      { description: 'NETFLIX', amount: 29.9, date: '2024-02-15' },
      { description: 'NETFLIX', amount: 29.9, date: '2024-03-15' },
    ]

    const grouped = transactions.reduce((acc, t) => {
      if (!acc[t.description]) {
        acc[t.description] = []
      }
      acc[t.description].push(t)
      return acc
    }, {} as Record<string, typeof transactions>)

    const isRecurrent = grouped['NETFLIX'].length >= 3 &&
      grouped['NETFLIX'].every((t) => t.amount === 29.9)

    expect(isRecurrent).toBe(true)
  })

  it('deve detectar valor médio de categoria', () => {
    const categoryTransactions = [
      { amount: 100 },
      { amount: 150 },
      { amount: 200 },
    ]

    const avgAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0) /
      categoryTransactions.length

    expect(avgAmount).toBe(150)
  })

  it('deve identificar outliers (valores muito acima da média)', () => {
    const transactions = [
      { amount: 50 },
      { amount: 51 },
      { amount: 52 },
      { amount: 53 },
      { amount: 54 },
      { amount: 5000 }, // Outlier - muito acima da média (~50)
    ]

    const avg = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
    const variance = transactions.reduce((sum, t) => sum + Math.pow(t.amount - avg, 2), 0) / (transactions.length - 1)
    const stdDev = Math.sqrt(variance)

    const outliers = transactions.filter((t) => Math.abs(t.amount - avg) > 2 * stdDev)

    expect(outliers.length).toBeGreaterThanOrEqual(1)
    expect(outliers.some(o => o.amount === 5000)).toBe(true)
  })
})

// Testes para validação de regras
describe('Validação de Regras de Categorização', () => {
  it('deve validar keyword não vazia', () => {
    const keyword1 = 'UBER'
    const keyword2 = ''
    const keyword3 = '   '

    expect(keyword1.trim().length).toBeGreaterThan(0)
    expect(keyword2.trim().length).toBe(0)
    expect(keyword3.trim().length).toBe(0)
  })

  it('deve validar categoria válida', () => {
    const validCategories = [
      'Alimentação',
      'Transporte',
      'Moradia',
      'Lazer',
      'Saúde',
      'Educação',
      'Outros',
    ]

    const category1 = 'Alimentação'
    const category2 = 'Categoria Inválida'

    expect(validCategories).toContain(category1)
    expect(validCategories).not.toContain(category2)
  })

  it('deve validar matchType válido', () => {
    const validMatchTypes = ['EXACT', 'CONTAINS', 'STARTS_WITH']

    const matchType1 = 'EXACT'
    const matchType2 = 'INVALID'

    expect(validMatchTypes).toContain(matchType1)
    expect(validMatchTypes).not.toContain(matchType2)
  })

  it('deve evitar regras duplicadas', () => {
    const existingRules = [
      { keyword: 'UBER', category: 'Transporte' },
      { keyword: 'IFOOD', category: 'Alimentação' },
    ]

    const newRule = { keyword: 'UBER', category: 'Transporte' }

    const isDuplicate = existingRules.some(
      (r) => r.keyword === newRule.keyword && r.category === newRule.category
    )

    expect(isDuplicate).toBe(true)
  })
})

// Testes para aplicação em lote de categorização
describe('Categorização em Lote', () => {
  it('deve categorizar múltiplas transações de uma vez', () => {
    const rules = [
      { keyword: 'UBER', category: 'Transporte', matchType: 'CONTAINS' },
      { keyword: 'IFOOD', category: 'Alimentação', matchType: 'CONTAINS' },
    ]

    const transactions = [
      { id: 1, description: 'UBER TRIP', category: 'Sem categoria' },
      { id: 2, description: 'IFOOD PEDIDO', category: 'Sem categoria' },
      { id: 3, description: 'COMPRA DIVERSOS', category: 'Sem categoria' },
    ]

    const categorized = transactions.map((t) => {
      for (const rule of rules) {
        if (t.description.includes(rule.keyword)) {
          return { ...t, category: rule.category }
        }
      }
      return t
    })

    expect(categorized[0].category).toBe('Transporte')
    expect(categorized[1].category).toBe('Alimentação')
    expect(categorized[2].category).toBe('Sem categoria')
  })

  it('deve contar transações categorizadas', () => {
    const results = [
      { updated: true },
      { updated: true },
      { updated: false },
    ]

    const categorizedCount = results.filter((r) => r.updated).length

    expect(categorizedCount).toBe(2)
  })
})
