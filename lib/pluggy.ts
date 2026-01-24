/**
 * Pluggy Open Finance Integration
 *
 * Cliente centralizado para comunicação com a API Pluggy.
 * Documentação: https://docs.pluggy.ai
 */

import { PluggyClient } from "pluggy-sdk"

// Permite rodar a aplicação sem credenciais Pluggy (desenvolvimento)
const hasPluggyCredentials = Boolean(
  process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET
)

// Lazy initialization para evitar overhead no startup
let pluggyInstance: PluggyClient | null = null

/**
 * Get Pluggy client instance (lazy loaded)
 */
function getPluggyClient(): PluggyClient {
  if (!hasPluggyCredentials) {
    throw new Error("Pluggy not configured. Set PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET.")
  }

  if (!pluggyInstance) {
    pluggyInstance = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID!,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
    })
  }

  return pluggyInstance
}

/**
 * Cliente Pluggy (use getPluggyClient() ao invés de acessar diretamente)
 */
export const pluggy = hasPluggyCredentials
  ? {
      get instance() {
        return getPluggyClient()
      },
    }
  : null

/**
 * Tipos Pluggy adaptados para nossa aplicação
 */

export interface PluggyConnectTokenResponse {
  accessToken: string
}

export interface PluggyItem {
  id: string
  connector: {
    id: number
    name: string
    institutionUrl: string
    imageUrl: string
    primaryColor: string
  }
  status: "UPDATED" | "UPDATING" | "LOGIN_ERROR" | "WAITING_USER_INPUT" | "OUTDATED"
  error?: {
    code: string
    message: string
  }
  createdAt: string
  updatedAt: string
  lastUpdatedAt?: string
  webhookUrl?: string
}

export interface PluggyAccount {
  id: string
  itemId: string
  type: "BANK" | "CREDIT"
  subtype: "CHECKING_ACCOUNT" | "SAVINGS_ACCOUNT" | "CREDIT_CARD"
  number?: string
  name: string
  balance: number
  currencyCode: string
  creditData?: {
    level: string
    brand: string
    balanceCloseDate?: string
    balanceDueDate?: string
    availableCreditLimit: number
    balanceForeignCurrency?: number
    minimumPayment?: number
    creditLimit: number
  }
}

export interface PluggyTransaction {
  id: string
  accountId: string
  description: string
  descriptionRaw?: string
  currencyCode: string
  amount: number
  date: string
  balance?: number
  category?: string
  providerCode?: string
  status?: "PENDING" | "POSTED"
  paymentData?: {
    payer?: string
    payee?: string
    paymentMethod?: string
    referenceNumber?: string
    reason?: string
  }
}

/**
 * Cria um Connect Token para iniciar conexão bancária
 */
export async function createConnectToken(): Promise<string> {
  const client = getPluggyClient()
  try {
    const response = await client.createConnectToken()
    return response.accessToken
  } catch (error) {
    console.error("[Pluggy] Error creating connect token:", error)
    throw new Error("Failed to create connect token")
  }
}

/**
 * Busca informações de um Item (conexão bancária)
 */
import type { Item } from "pluggy-sdk/dist/types/item"
import type { Transaction } from "pluggy-sdk/dist/types/transaction"
import type { Account } from "pluggy-sdk/dist/types/account"

export async function getItem(itemId: string): Promise<Item> {
  const client = getPluggyClient()

  try {
    return await client.fetchItem(itemId)
  } catch (error) {
    console.error(`[Pluggy] Error fetching item ${itemId}:`, error)
    throw new Error("Failed to fetch bank connection")
  }
}

/**
 * Atualiza um Item (força nova sincronização)
 */
export async function updateItem(itemId: string): Promise<Item> {
  const client = getPluggyClient()

  try {
    return await client.updateItem(itemId)
  } catch (error) {
    console.error(`[Pluggy] Error updating item ${itemId}:`, error)
    throw new Error("Failed to update bank connection")
  }
}

/**
 * Deleta um Item (remove conexão bancária)
 */
export async function deleteItem(itemId: string): Promise<void> {
  const client = getPluggyClient()

  try {
    await client.deleteItem(itemId)
  } catch (error) {
    console.error(`[Pluggy] Error deleting item ${itemId}:`, error)
    throw new Error("Failed to delete bank connection")
  }
}

/**
 * Lista todas as contas de um Item
 */
export async function getAccounts(itemId: string): Promise<Account[]> {
  const client = getPluggyClient()

  try {
    const response = await client.fetchAccounts(itemId)
    return response.results
  } catch (error) {
    console.error(`[Pluggy] Error fetching accounts for item ${itemId}:`, error)
    throw new Error("Failed to fetch accounts")
  }
}

/**
 * Busca transações de uma conta
 *
 * @param accountId - ID da conta no Pluggy
 * @param from - Data inicial (ISO string)
 * @param to - Data final (ISO string)
 */
export async function getTransactions(
  accountId: string,
  from?: string,
  to?: string
): Promise<Transaction[]> {
  const client = getPluggyClient()

  try {
    const response = await client.fetchTransactions(accountId, {
      from,
      to,
    })
    return response.results
  } catch (error) {
    console.error(`[Pluggy] Error fetching transactions for account ${accountId}:`, error)
    throw new Error("Failed to fetch transactions")
  }
}

/**
 * Valida assinatura de webhook do Pluggy
 *
 * Importante: use este método em production para garantir que
 * o webhook realmente veio do Pluggy e não foi forjado.
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string = process.env.PLUGGY_WEBHOOK_SECRET || ""
): boolean {
  const crypto = require("crypto")
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

/**
 * Mapeia status do Pluggy para nosso enum
 */
import type { ItemStatus } from "pluggy-sdk/dist/types/item"
export function mapPluggyStatus(
  status: ItemStatus
): "ACTIVE" | "UPDATING" | "LOGIN_ERROR" | "OUTDATED" | "DISCONNECTED" {
  const statusMap = {
    UPDATED: "ACTIVE",
    UPDATING: "UPDATING",
    LOGIN_ERROR: "LOGIN_ERROR",
    WAITING_USER_INPUT: "LOGIN_ERROR",
    OUTDATED: "OUTDATED",
    WAITING_USER_ACTION: "LOGIN_ERROR",
    MERGING: "UPDATING",
  } as const
  return statusMap[status] || "DISCONNECTED"
}

/**
 * Mapeia tipo de conta do Pluggy para nosso enum
 */
export function mapAccountType(
  pluggyAccount: PluggyAccount
): "CHECKING" | "SAVINGS" | "INVESTMENT" | "CASH" | "OTHER" {
  if (pluggyAccount.type === "CREDIT") return "OTHER"

  const subtypeMap = {
    CHECKING_ACCOUNT: "CHECKING",
    SAVINGS_ACCOUNT: "SAVINGS",
    CREDIT_CARD: "OTHER",
  } as const

  return subtypeMap[pluggyAccount.subtype] || "OTHER"
}

/**
 * Determina tipo de transação baseado no amount
 */
export function mapTransactionType(amount: number): "INCOME" | "EXPENSE" | "TRANSFER" {
  if (amount > 0) return "INCOME"
  if (amount < 0) return "EXPENSE"
  return "TRANSFER"
}
