import { apiRequest } from './api'
import type {
  AdminReceiptDetail,
  AdminReceiptsResponse,
} from '../types'

export interface FetchReceiptsParams {
  limit?: number
  offset?: number
  search?: string
  payment_type?: string
}

export async function fetchAdminReceipts(params: FetchReceiptsParams = {}): Promise<AdminReceiptsResponse> {
  return apiRequest<AdminReceiptsResponse>('/admin/receipts', {
    params: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      search: params.search,
      payment_type: params.payment_type,
    },
  })
}

export async function fetchAdminReceiptDetail(id: number): Promise<AdminReceiptDetail> {
  return apiRequest<AdminReceiptDetail>(`/admin/receipts/${id}`)
}
