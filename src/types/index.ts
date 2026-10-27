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
  new_users_today: number
  new_users_this_week?: number
  new_users_this_month: number
  active_users_today?: number
  active_users_this_month?: number
  total_transactions: number
  transactions_today?: number
  total_receipts_scanned?: number
  receipts_scanned_today?: number
  total_income_all_time?: number
  total_expense_all_time?: number
  total_income?: number
  total_expense?: number
  income_today?: number
  expense_today?: number
  income_this_month?: number
  expense_this_month?: number
  total_deleted_accounts?: number
  // Convenient fields
  dau?: number
  mau?: number
  retention_rate_pct?: number
  total_balance?: number
  total_receipts?: number
  ai_message_count?: number
  ai_transaction_count?: number
}

export interface AdminUserListItem {
  id?: number
  user_id?: number
  full_name: string
  email: string
  avatar_url?: string | null
  auth_provider: string
  is_blocked: boolean
  blocked_reason?: string | null
  is_admin?: boolean
  is_super_admin?: boolean
  is_protected?: boolean
  balance?: number
  total_income?: number
  total_expense?: number
  transaction_count: number
  receipt_count?: number
  device_count?: number
  joined_at?: string
  last_activity_at?: string | null
  created_at?: string
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
  id?: number
  user_id?: number
  full_name: string
  email: string
  avatar_url?: string | null
  auth_provider: string
  is_blocked: boolean
  blocked_reason?: string | null
  blocked_at?: string | null
  is_admin?: boolean
  is_super_admin?: boolean
  is_protected?: boolean
  balance?: number
  total_income?: number
  total_expense?: number
  transaction_count?: number
  receipt_count?: number
  ai_message_count?: number
  last_ai_activity_at?: string | null
  ai_transaction_count?: number
  friend_count?: number
  devices?: any[]
  monthly_dynamics?: any[]
  top_categories?: any[]
  recent_transactions?: any[]
  joined_at?: string
  last_activity_at?: string | null
  created_at?: string
}

export interface CategoryStatItem {
  name: string
  icon?: string
  color?: string
  total_amount: number
  transaction_count: number
  user_count?: number
  percentage?: number
}

export interface CategoriesAnalyticsData {
  top_expense_categories: CategoryStatItem[]
  top_income_categories: CategoryStatItem[]
}

export interface DevicePlatformItem {
  platform: string
  count: number
  percentage: number
}

export interface DeviceModelItem {
  device_name: string
  count: number
  percentage: number
}

export interface AppVersionItem {
  app_version: string
  count: number
  percentage: number
}

export interface DevicesAnalyticsData {
  total_active_devices: number
  platforms: DevicePlatformItem[]
  top_devices: DeviceModelItem[]
  top_app_versions: AppVersionItem[]
}

export interface DeletionReasonItem {
  reason: string
  count: number
  percentage: number
}

export interface RecentDeletionItem {
  id: number
  user_id: number
  email: string
  full_name: string
  auth_provider: string
  reason: string
  feedback?: string
  total_transactions?: number
  total_income?: number
  total_expense?: number
  registered_at?: string
  deleted_at: string
}

export interface DeletionsAnalyticsData {
  total_deleted: number
  deleted_this_month: number
  reasons_breakdown: DeletionReasonItem[]
  recent_deletions: RecentDeletionItem[]
  total: number
  limit: number
  offset: number
}

export interface BroadcastNotification {
  id: number
  title: string
  body: string
  image_url?: string | null
  status: 'sent' | 'scheduled' | 'cancelled' | 'pending' | string
  scheduled_at?: string | null
  sent_at?: string | null
  target_type?: string
  sent_count?: number
  recipient_count?: number
  created_by?: number
  created_at: string
  updated_at?: string
}

export interface BroadcastListResponse {
  items: BroadcastNotification[]
  total: number
  page: number
  limit: number
}

export interface PermissionMeta {
  code: string
  name: string
  description: string
  category: string
}

export interface AdminUserWithPerms {
  id?: number
  user_id?: number
  full_name: string
  email: string
  avatar_url?: string | null
  is_super_admin: boolean
  permissions: string[]
  permissions_count?: number
  granted_at?: string
  granted_by_name?: string
  created_at?: string
}

export interface CashflowTrendPoint {
  date: string
  income: number
  expense: number
  transaction_count?: number
}

export interface UserGrowthPoint {
  year: number
  month: number
  month_name: string
  count: number
}

export interface EcosystemRadarPoint {
  metric: string
  score: number
  benchmark: number
  full_mark?: number
}

export interface RankingUserItem {
  user_id: number
  full_name: string
  email: string
  avatar_url?: string | null
  transaction_count: number
  total_amount: number
  rank: number
}

export interface AdminOverviewCharts {
  monthly_dynamics: AdminMonthlyDynamic[]
  user_growth: UserGrowthPoint[]
  cashflow_trends: CashflowTrendPoint[]
  ecosystem_radar: EcosystemRadarPoint[]
  top_users_ranking: RankingUserItem[]
}

export * from './support'
export * from './protectedUsers'
export * from './receipts'
