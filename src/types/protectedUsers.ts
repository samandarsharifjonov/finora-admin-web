export interface ProtectedUser {
  id: number
  user_id: number
  email: string
  full_name: string
  avatar_url?: string | null
  auth_provider: string
  protected_at: string
  protected_by?: number | null
  protected_by_email?: string
  joined_at?: string
  total_income: number
  total_expense: number
  transaction_count: number
  is_active: boolean
}

export interface ProtectedCandidateUser {
  user_id: number
  email: string
  full_name: string
  avatar_url?: string | null
  auth_provider: string
  total_income: number
  total_expense: number
  transaction_count: number
}

export interface ProtectedCandidatesResponse {
  users: ProtectedCandidateUser[]
  total: number
  limit: number
  offset: number
}

export interface AddProtectedUsersRequest {
  user_ids: number[]
}
