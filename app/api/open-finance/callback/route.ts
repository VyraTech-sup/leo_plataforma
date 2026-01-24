/**
 * POST /api/open-finance/callback
 * 
 * Callback executado após o usuário conectar sua conta bancária no widget do Pluggy.
 * Salva a conexão no banco de dados e inicia a primeira sincronização.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getItem, mapPluggyStatus } from '@/lib/pluggy'
import { z } from 'zod'

const callbackSchema = z.object({
  itemId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 2. Validar body
    const body = await request.json()
    const validation = callbackSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { itemId } = validation.data

    // 3. Buscar informações do item no Pluggy
    const item = await getItem(itemId)

    // 4. Salvar conexão no banco
    const connection = await prisma.bankConnection.upsert({
      where: { itemId },
      create: {
        userId: user.id,
        provider: 'PLUGGY',
        itemId,
        status: mapPluggyStatus(item.status),
        error: item.error?.message || null,
        lastSyncAt: new Date(),
      },
      update: {
        status: mapPluggyStatus(item.status),
        error: item.error?.message || null,
        lastSyncAt: new Date(),
      },
    })

    console.log(`[Callback] Created/updated connection ${connection.id} for user ${user.id}`)

    // 5. Webhook do Pluggy fará a sincronização das contas e transações

    return NextResponse.json({
      message: 'Bank connected successfully. Syncing data...',
      connectionId: connection.id,
    })
  } catch (error) {
    console.error('[API] Error in callback:', error)
    return NextResponse.json(
      { error: 'Failed to process bank connection' },
      { status: 500 }
    )
  }
}
