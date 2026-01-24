/**
 * POST /api/open-finance/webhook
 * 
 * Recebe eventos do Pluggy quando há alterações nas conexões/contas/transações.
 * 
 * Eventos principais:
 * - item/created: Nova conexão estabelecida
 * - item/updated: Conexão atualizada (sincronização concluída)
 * - item/error: Erro na conexão (credenciais inválidas, etc)
 * - item/deleted: Conexão removida
 * 
 * Documentação: https://docs.pluggy.ai/docs/webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  getItem,
  getAccounts,
  getTransactions,
  mapPluggyStatus,
  mapAccountType,
  mapTransactionType,
  validateWebhookSignature,
} from '@/lib/pluggy'

interface WebhookEvent {
  event: 'item/created' | 'item/updated' | 'item/error' | 'item/deleted' | 'item/waiting_user_input'
  data: {
    itemId: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validar assinatura do webhook (segurança)
    const signature = request.headers.get('x-pluggy-signature')
    const rawBody = await request.text()

    if (process.env.PLUGGY_WEBHOOK_SECRET && signature) {
      const isValid = validateWebhookSignature(
        rawBody,
        signature,
        process.env.PLUGGY_WEBHOOK_SECRET
      )

      if (!isValid) {
        console.error('[Webhook] Invalid signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // 2. Parse do evento
    const event: WebhookEvent = JSON.parse(rawBody)
    const { itemId } = event.data

    console.log(`[Webhook] Received event: ${event.event} for item ${itemId}`)

    // 3. Buscar conexão no banco
    const connection = await prisma.bankConnection.findUnique({
      where: { itemId },
      include: { user: true },
    })

    if (!connection) {
      console.warn(`[Webhook] Connection not found for item ${itemId}`)
      // Retornar 200 mesmo assim para o Pluggy não retentar
      return NextResponse.json({ ok: true })
    }

    // 4. Processar evento
    switch (event.event) {
      case 'item/created':
      case 'item/updated':
        await handleItemUpdated(connection.id, itemId, connection.userId)
        break

      case 'item/error':
        await handleItemError(connection.id, itemId)
        break

      case 'item/deleted':
        await handleItemDeleted(connection.id)
        break

      case 'item/waiting_user_input':
        await handleItemWaitingInput(connection.id)
        break

      default:
        console.log(`[Webhook] Unhandled event type: ${event.event}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    // Retornar 200 para evitar retentativas do Pluggy
    // Em produção, considere usar uma fila para reprocessar
    return NextResponse.json({ ok: true })
  }
}

/**
 * Sincroniza contas e transações quando o item é atualizado
 */
async function handleItemUpdated(
  connectionId: string,
  itemId: string,
  userId: string
) {
  try {
    // 1. Buscar informações atualizadas do item
    const item = await getItem(itemId)

    // 2. Atualizar status da conexão
    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: {
        status: mapPluggyStatus(item.status),
        error: item.error?.message || null,
        lastSyncAt: new Date(),
      },
    })

    // 3. Buscar contas do item
    const pluggyAccounts = await getAccounts(itemId)

    // 4. Sincronizar cada conta
    for (const pluggyAccount of pluggyAccounts) {
      await syncAccount(connectionId, userId, pluggyAccount, item.connector.name)
    }

    console.log(`[Webhook] Successfully synced ${pluggyAccounts.length} accounts for item ${itemId}`)
  } catch (error) {
    console.error(`[Webhook] Error syncing item ${itemId}:`, error)
    throw error
  }
}

/**
 * Sincroniza uma conta individual
 */
async function syncAccount(
  connectionId: string,
  userId: string,
  pluggyAccount: any,
  institutionName: string
) {
  // 1. Upsert da conta
  const account = await prisma.account.upsert({
    where: { externalAccountId: pluggyAccount.id },
    create: {
      userId,
      connectionId,
      externalAccountId: pluggyAccount.id,
      name: pluggyAccount.name || `${institutionName} - ${pluggyAccount.subtype}`,
      type: mapAccountType(pluggyAccount),
      institution: institutionName,
      balance: pluggyAccount.balance || 0,
      currency: pluggyAccount.currencyCode || 'BRL',
    },
    update: {
      name: pluggyAccount.name || `${institutionName} - ${pluggyAccount.subtype}`,
      balance: pluggyAccount.balance || 0,
      type: mapAccountType(pluggyAccount),
    },
  })

  // 2. Buscar transações dos últimos 90 dias
  const from = new Date()
  from.setDate(from.getDate() - 90)

  const pluggyTransactions = await getTransactions(
    pluggyAccount.id,
    from.toISOString(),
    new Date().toISOString()
  )

  // 3. Inserir/atualizar transações (idempotente)
  for (const pluggyTx of pluggyTransactions) {
    await prisma.transaction.upsert({
      where: { externalTransactionId: pluggyTx.id },
      create: {
        userId,
        accountId: account.id,
        externalTransactionId: pluggyTx.id,
        description: pluggyTx.description,
        amount: pluggyTx.amount,
        type: mapTransactionType(pluggyTx.amount),
        category: pluggyTx.category || 'Outros',
        date: new Date(pluggyTx.date),
        isPending: pluggyTx.status === 'PENDING',
      },
      update: {
        description: pluggyTx.description,
        amount: pluggyTx.amount,
        category: pluggyTx.category || 'Outros',
        isPending: pluggyTx.status === 'PENDING',
      },
    })
  }

  console.log(`[Webhook] Synced ${pluggyTransactions.length} transactions for account ${pluggyAccount.id}`)
}

/**
 * Marca conexão com erro
 */
async function handleItemError(connectionId: string, itemId: string) {
  try {
    const item = await getItem(itemId)

    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: {
        status: 'LOGIN_ERROR',
        error: item.error?.message || 'Unknown error',
      },
    })

    console.log(`[Webhook] Marked connection ${connectionId} as LOGIN_ERROR`)
  } catch (error) {
    console.error(`[Webhook] Error handling item error for ${itemId}:`, error)
  }
}

/**
 * Remove conexão e contas associadas
 */
async function handleItemDeleted(connectionId: string) {
  try {
    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: {
        status: 'DISCONNECTED',
      },
    })

    console.log(`[Webhook] Marked connection ${connectionId} as DISCONNECTED`)
  } catch (error) {
    console.error(`[Webhook] Error handling item deletion:`, error)
  }
}

/**
 * Marca conexão aguardando input do usuário
 */
async function handleItemWaitingInput(connectionId: string) {
  try {
    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: {
        status: 'LOGIN_ERROR',
        error: 'Aguardando autenticação do usuário',
      },
    })

    console.log(`[Webhook] Marked connection ${connectionId} as waiting for user input`)
  } catch (error) {
    console.error(`[Webhook] Error handling waiting input:`, error)
  }
}
