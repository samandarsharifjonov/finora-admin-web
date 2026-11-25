export interface AdminAuditLog {
  id: number
  actor_id?: number | null
  actor_email: string
  actor_name: string
  action: string
  target_type: string
  target_id?: number | null
  summary: string
  details?: Record<string, unknown>
  ip_address: string
  user_agent?: string
  created_at: string
}

export interface AdminAuditLogListResponse {
  logs: AdminAuditLog[]
  total: number
  limit: number
  offset: number
}
