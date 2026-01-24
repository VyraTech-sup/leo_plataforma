 import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin(email: string, password: string) {
  console.log(`\n🧪 Testando login: ${email}`)
  console.log('─'.repeat(50))

  try {
    // 1. Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado no banco de dados')
      return false
    }

    console.log('✅ Usuário encontrado:')
    console.log(`   Nome: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Hash armazenado: ${user.password.substring(0, 30)}...`)

    // 2. Verificar senha
    console.log(`\n🔐 Testando senha: "${password}"`)
    const isValid = await bcrypt.compare(password, user.password)

    if (isValid) {
      console.log('✅ SENHA CORRETA! Login deveria funcionar.')
      return true
    } else {
      console.log('❌ SENHA INCORRETA!')
      
      // Testar hash direto para debug
      const testHash = await bcrypt.hash(password, 10)
      console.log(`\n🔍 Debug:`)
      console.log(`   Senha testada: "${password}"`)
      console.log(`   Hash atual no banco: ${user.password}`)
      console.log(`   Novo hash da mesma senha: ${testHash}`)
      
      return false
    }
  } catch (error) {
    console.error('❌ Erro ao testar login:', error)
    return false
  }
}

async function main() {
  console.log('🔐 TESTE DE AUTENTICAÇÃO - LMG Platform')
  console.log('═'.repeat(50))

  // Testar ambas as contas
  await testLogin('admin@lmg.com', 'admin123')
  await testLogin('user@lmg.com', 'user123')

  console.log('\n' + '═'.repeat(50))
  console.log('✨ Teste concluído!')
}

main()
  .catch((e) => {
    console.error('Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
