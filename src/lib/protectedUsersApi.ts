import { apiRequest } from './api'
import type {
  ProtectedUser,
  ProtectedCandidatesResponse,
} from '../types'

export async function fetchProtectedUsers(): Promise<ProtectedUser[]> {
  return apiRequest<ProtectedUser[]>('/admin/protected-users')
}

export async function addProtectedUsers(userIds: number[]): Promise<void> {
  return apiRequest<void>('/admin/protected-users', {
    method: 'POST',
    body: JSON.stringify({ user_ids: userIds }),
  })
}

export async function removeProtectedUser(id: number): Promise<void> {
  return apiRequest<void>(`/admin/protected-users/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchProtectedCandidates(params?: {
  search?: string
  limit?: number
  offset?: number
}): Promise<ProtectedCandidatesResponse> {
  return apiRequest<ProtectedCandidatesResponse>('/admin/protected-users/candidates', {
    params: {
      search: params?.search,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    },
  })
}
