export const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://api-production-9127.up.railway.app/api/v1'

export function getBaseApiUrl(): string {
  return localStorage.getItem('finora_api_url') || DEFAULT_API_URL
}

export function setBaseApiUrl(url: string): void {
  localStorage.setItem('finora_api_url', url)
}

export function getToken(): string | null {
  return localStorage.getItem('finora_admin_token')
}

export function setToken(token: string): void {
  localStorage.setItem('finora_admin_token', token)
}

export function removeToken(): void {
  localStorage.removeItem('finora_admin_token')
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getBaseApiUrl().replace(/\/+$/, '')
  let url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  if (options.params) {
    const searchParams = new URLSearchParams()
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val))
      }
    })
    const qs = searchParams.toString()
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const resJson = await response.json().catch(() => null)

  // 401 Unauthorized handling
  if (response.status === 401) {
    if (endpoint.includes('/auth/login')) {
      const errorMsg = resJson?.error || resJson?.message || "Email yoki parol noto'g'ri"
      throw new Error(errorMsg)
    }
    removeToken()
    throw new Error('Sessiya muddati tugadi, qaytadan tizimga kiring')
  }

  if (!response.ok) {
    const errorMsg = resJson?.error || resJson?.message || `Xatolik: ${response.status} ${response.statusText}`
    throw new Error(errorMsg)
  }

  // Go backend wraps all responses in { success: boolean, message?: string, data?: any }
  if (resJson && typeof resJson === 'object' && 'data' in resJson && resJson.data !== undefined) {
    return resJson.data
  }

  return resJson
}

