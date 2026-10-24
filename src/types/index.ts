export interface User {
  id: number
  email: string
  full_name: string
  avatar_url?: string | null
  auth_provider: string
  is_admin: boolean
  is_super_admin: boolean
  permissions: string[]
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
  message?: string
}

export interface AdminOverview {
  total_users: number
  total_active_users: number
  dau: number
  mau: number
  retention_rate_pct: number
  total_balance: number
  total_income: number
  total_expense: number
  total_transactions: number
  total_receipts: number
  total_accounts: number
  total_categories: number
  new_users_today: number
  new_users_this_month: number
  ai_message_count: number
  ai_transaction_count: number
}

export interface AdminUserListItem {
  id: number
  full_name: string
  email: string
  avatar_url?: string | null
  auth_provider: string
  is_blocked: boolean
  blocked_reason?: string | null
  is_admin: boolean
  is_super_admin: boolean
  is_protected?: boolean
  balance: number
  transaction_count: number
  receipt_count: number
  last_activity?: string | null
  created_at: string
}

export interface AdminUserListResponse {
  total: number
  limit: number
  offset: number
  users: AdminUserListItem[]
}

export interface AdminUserDevice {
  device_id: string
  device_name: string
  device_type: string
  os_version: string
  app_version: string
  is_active: boolean
  last_seen: string
}

export interface AdminMonthlyDynamic {
  year: number
  month: number
  income: number
  expense: number
  transaction_count: number
}

export interface AdminTopCategory {
  category_id: number
  category_name: string
  category_color?: string
  category_icon?: string
  total_amount: number
  transaction_count: number
  type: string
}

export interface AdminUserTransaction {
  id: number
  amount: number
  type: 'income' | 'expense'
  description?: string
  category_name?: string
  category_color?: string
  account_name?: string
  transaction_date: string
  created_at: string
}

export interface AdminUserDetail {
  id: number
  full_name: string
  email: string
  avatar_url?: string | null
  auth_provider: string
  is_blocked: boolean
  blocked_reason?: string | null
  blocked_at?: string | null
  is_admin: boolean
  is_super_admin: boolean
  is_protected?: boolean
  balance: number
  total_income: number
  total_expense: number
  transaction_count: number
  receipt_count: number
  ai_message_count: number
  last_ai_activity_at?: string | null
  ai_transaction_count: number
  friend_count: number
  devices: AdminUserDevice[]
  monthly_dynamics: AdminMonthlyDynamic[]
  top_categories: AdminTopCategory[]
  recent_transactions: AdminUserTransaction[]
  created_at: string
}

export interface CategoryAnalyticsItem {
  id: number
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  usage_count: number
  total_amount: number
}

export interface DeviceAnalyticsItem {
  platform: string
  device_count: number
  percentage: number
}

export interface DeletionAnalyticsItem {
  id: number
  user_id: number
  user_email: string
  user_name: string
  reason?: string | null
  feedback?: string | null
  deleted_at: string
}

export interface BroadcastNotification {
  id: number
  title: string
  body: string
  image_url?: string | null
  status: 'sent' | 'scheduled' | 'cancelled' | 'pending'
  scheduled_at?: string | null
  sent_at?: string | null
  recipient_count: number
  created_at: string
}

export interface PermissionMeta {
  code: string
  name: string
  description: string
  category: string
}

export interface AdminUserWithPerms {
  id: number
  full_name: string
  email: string
  avatar_url?: string | null
  is_super_admin: boolean
  permissions: string[]
  created_at: string
}
