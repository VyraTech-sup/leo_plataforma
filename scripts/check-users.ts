import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando usuários no banco de dados...\n')
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      createdAt: true,
    }
  })

  if (users.length === 0) {
    console.log('❌ Nenhum usuário encontrado no banco de dados!')
    console.log('\n💡 Execute o seed para criar usuários de teste:')
    console.log('   npx tsx prisma/seed.ts')
  } else {
    console.log(`✅ ${users.length} usuário(s) encontrado(s):\n`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Senha hash: ${user.password.substring(0, 20)}...`)
      console.log(`   Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`)
      console.log('')
    })

    console.log('\n🔑 Credenciais para login:')
    console.log('   Admin: admin@lmg.com / admin123')
    console.log('   User:  user@lmg.com / user123')
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao verificar usuários:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
