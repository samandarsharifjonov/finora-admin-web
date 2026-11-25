import { apiRequest } from './api'
import type { AdminAuditLogListResponse } from '../types/auditLog'

export interface FetchAuditLogsParams {
  limit?: number
  offset?: number
  action?: string
  search?: string
  start_date?: string
  end_date?: string
}

export async function fetchAuditLogs(
  params: FetchAuditLogsParams = {}
): Promise<AdminAuditLogListResponse> {
  return apiRequest<AdminAuditLogListResponse>('/admin/audit-logs', {
    params: {
      limit: params.limit ?? 25,
      offset: params.offset ?? 0,
      action: params.action && params.action !== 'all' ? params.action : undefined,
      search: params.search || undefined,
      start_date: params.start_date || undefined,
      end_date: params.end_date || undefined,
    },
  })
}
