import { apiRequest } from './api'
import type { AdminAuditLogListResponse, AuditAdminSummary } from '../types/auditLog'

export interface FetchAuditLogsParams {
  limit?: number
  offset?: number
  actor_id?: number
  action?: string
  search?: string
  start_date?: string
  end_date?: string
}

export async function fetchAuditAdmins(): Promise<AuditAdminSummary[]> {
  return apiRequest<AuditAdminSummary[]>('/admin/audit-logs/admins')
}

export async function fetchAuditLogs(
  params: FetchAuditLogsParams = {}
): Promise<AdminAuditLogListResponse> {
  return apiRequest<AdminAuditLogListResponse>('/admin/audit-logs', {
    params: {
      limit: params.limit ?? 25,
      offset: params.offset ?? 0,
      actor_id: params.actor_id || undefined,
      action: params.action && params.action !== 'all' ? params.action : undefined,
      search: params.search || undefined,
      start_date: params.start_date || undefined,
      end_date: params.end_date || undefined,
    },
  })
}
