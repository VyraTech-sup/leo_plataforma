/**
 * POST /api/open-finance/sync
 * 
 * Força sincronização manual de uma conexão bancária específica.
 * Útil quando o usuário quer atualizar dados imediatamente.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateItem } from '@/lib/pluggy'
import { z } from 'zod'

const syncSchema = z.object({
  connectionId: z.string().cuid(),
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
    const validation = syncSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { connectionId } = validation.data

    // 3. Buscar conexão (garantir que pertence ao usuário)
    const connection = await prisma.bankConnection.findFirst({
      where: {
        id: connectionId,
        userId: user.id,
      },
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // 4. Verificar se conexão está em bom estado
    if (connection.status === 'LOGIN_ERROR') {
      return NextResponse.json(
        { error: 'Connection has login error. Please reconnect your bank account.' },
        { status: 400 }
      )
    }

    if (connection.status === 'DISCONNECTED') {
      return NextResponse.json(
        { error: 'Connection is disconnected. Please reconnect your bank account.' },
        { status: 400 }
      )
    }

    // 5. Marcar como atualizando
    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: { status: 'UPDATING' },
    })

    // 6. Solicitar atualização ao Pluggy (assíncrono)
    // O webhook receberá a notificação quando concluir
    await updateItem(connection.itemId)

    return NextResponse.json({
      message: 'Sync initiated. You will receive updated data shortly.',
      connectionId,
    })
  } catch (error) {
    console.error('[API] Error syncing connection:', error)
    return NextResponse.json(
      { error: 'Failed to sync connection' },
      { status: 500 }
    )
  }
}
