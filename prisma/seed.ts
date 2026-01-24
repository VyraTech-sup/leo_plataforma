import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar usuários
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@lmg.com' },
    update: {},
    create: {
      email: 'admin@lmg.com',
      name: 'Admin LMG',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@lmg.com' },
    update: {},
    create: {
      email: 'user@lmg.com',
      name: 'João Silva',
      password: userPassword,
      role: 'USER',
    },
  })

  console.log('✅ Usuários criados')

  // Criar contas para o usuário comum
  const checkingAccount = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Nubank',
      type: 'CHECKING',
      institution: 'Nubank',
      balance: 5420.50,
      currency: 'BRL',
      color: '#8A05BE',
    },
  })

  await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Poupança Inter',
      type: 'SAVINGS',
      institution: 'Banco Inter',
      balance: 12800.00,
      currency: 'BRL',
      color: '#FF7A00',
    },
  })

  await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Carteira',
      type: 'CASH',
      institution: 'Físico',
      balance: 350.00,
      currency: 'BRL',
    },
  })

  console.log('✅ Contas criadas')

  // Criar cartões
  await prisma.card.create({
    data: {
      userId: user.id,
      name: 'Nubank Platinum',
      lastFourDigits: '4532',
      brand: 'Mastercard',
      limit: 8000.00,
      closingDay: 15,
      dueDay: 25,
      color: '#8A05BE',
    },
  })

  console.log('✅ Cartões criados')

  // Criar transações dos últimos 6 meses
  const now = new Date()
  
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    
    // Receita mensal (salário)
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        type: 'INCOME',
        category: 'Salário',
        amount: 6500.00,
        description: 'Salário Mensal',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5),
      },
    })

    // Despesas variadas
    const expenses = [
      { category: 'Moradia', amount: 1200, desc: 'Aluguel' },
      { category: 'Alimentação', amount: 850, desc: 'Mercado' },
      { category: 'Transporte', amount: 320, desc: 'Uber e transporte' },
      { category: 'Lazer', amount: 450, desc: 'Restaurantes e cinema' },
      { category: 'Saúde', amount: 280, desc: 'Farmácia' },
      { category: 'Educação', amount: 180, desc: 'Cursos online' },
      { category: 'Outros', amount: 420, desc: 'Diversos' },
    ]

    for (const expense of expenses) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: checkingAccount.id,
          type: 'EXPENSE',
          category: expense.category,
          amount: expense.amount + Math.random() * 200 - 100, // Variação
          description: expense.desc,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1),
        },
      })
    }
  }

  console.log('✅ Transações criadas')

  // Criar metas
  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Reserva de Emergência',
      targetAmount: 20000.00,
      currentAmount: 12800.00,
      category: 'Poupança',
      deadline: new Date(now.getFullYear() + 2, 11, 31),
    },
  })

  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Viagem para Europa',
      targetAmount: 15000.00,
      currentAmount: 4500.00,
      deadline: new Date(now.getFullYear() + 1, 6, 1),
      category: 'Lazer',
    },
  })

  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Curso de MBA',
      targetAmount: 8000.00,
      currentAmount: 2100.00,
      category: 'Educação',
      deadline: new Date(now.getFullYear() + 1, 2, 1),
    },
  })

  console.log('✅ Metas criadas')

  // Criar investimentos
  await prisma.investment.create({
    data: {
      userId: user.id,
      name: 'Tesouro Selic 2029',
      type: 'FIXED_INCOME',
      amount: 5000.00,
      currentValue: 5420.00,
      institution: 'Tesouro Direto',
      acquiredAt: new Date(2023, 0, 15),
      maturityDate: new Date(2029, 11, 31),
      profitability: 8.40,
    },
  })

  await prisma.investment.create({
    data: {
      userId: user.id,
      name: 'PETR4',
      type: 'STOCKS',
      amount: 3000.00,
      currentValue: 3450.00,
      quantity: 100,
      institution: 'Clear Corretora',
      ticker: 'PETR4',
      acquiredAt: new Date(2023, 5, 20),
      profitability: 15.00,
    },
  })

  await prisma.investment.create({
    data: {
      userId: user.id,
      name: 'Bitcoin',
      type: 'CRYPTO',
      amount: 2000.00,
      currentValue: 2850.00,
      quantity: 0.015,
      institution: 'Binance',
      ticker: 'BTC',
      acquiredAt: new Date(2023, 8, 10),
      profitability: 42.50,
    },
  })

  console.log('✅ Investimentos criados')

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📧 Credenciais de acesso:')
  console.log('👤 Admin: admin@lmg.com / admin123')
  console.log('👤 User:  user@lmg.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
