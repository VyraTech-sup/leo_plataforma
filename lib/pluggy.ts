/**
 * Pluggy Open Finance Integration
 *
 * Cliente centralizado para comunicação com a API Pluggy.
 * Documentação: https://docs.pluggy.ai
 */

import axios, { AxiosInstance } from "axios"
import crypto from "crypto"

const PLUGGY_BASE_URL = "https://api.pluggy.ai"
const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID!
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET!

let cachedToken: string | null = null
let tokenExpiresAt: number | null = null
let axiosInstance: AxiosInstance | null = null

function getAxios(): AxiosInstance {
  if (!axiosInstance) {
    axiosInstance = axios.create({ baseURL: PLUGGY_BASE_URL })
  }
  return axiosInstance
}

export async function getPluggyToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken
  }
  const res = await getAxios().post("/auth", {
    clientId: PLUGGY_CLIENT_ID,
    clientSecret: PLUGGY_CLIENT_SECRET,
  })
  cachedToken = res.data.accessToken
  tokenExpiresAt = now + (res.data.expiresIn ? res.data.expiresIn * 1000 - 60000 : 9 * 60 * 1000) // 1 min safety
  return cachedToken
}

export async function createPluggyItem(connectorId: number, parameters: any): Promise<any> {
  const token = await getPluggyToken()
  const res = await getAxios().post(
    "/items",
    { connectorId, parameters },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return res.data
}

export async function getPluggyAccounts(itemId: string): Promise<any[]> {
  const token = await getPluggyToken()
  const res = await getAxios().get(`/items/${itemId}/accounts`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.results
}

export async function getPluggyTransactions(
  accountId: string,
  from?: string,
  to?: string
): Promise<any[]> {
  const token = await getPluggyToken()
  const params: any = {}
  if (from) params.from = from
  if (to) params.to = to
  const res = await getAxios().get(`/accounts/${accountId}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  })
  return res.data.results
}

export async function getPluggyItemStatus(itemId: string): Promise<any> {
  const token = await getPluggyToken()
  const res = await getAxios().get(`/items/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function listPluggyConnectors(): Promise<any[]> {
  const token = await getPluggyToken()
  const res = await getAxios().get("/connectors", {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.results
}

export function validatePluggyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
