import type { Transaction } from "@/types"
import { get, post } from "./http-client"

/**
 * Fetch all transactions
 */
export async function fetchTransactions(): Promise<{ data: Transaction[] }> {
  return get<{ data: Transaction[] }>("/payments")
}

/**
 * Fetch transaction by ID
 */
export async function fetchTransactionById(id: string): Promise<Transaction> {
  return get<Transaction>(`/payments/${id}`)
}

/**
 * Process refund
 */
export async function processRefund(transactionId: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>(`/payments/${transactionId}/refund`, {})
}

