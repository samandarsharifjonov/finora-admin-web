export const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://api-production-9127.up.railway.app/api/v1'

export function getBaseApiUrl(): string {
  return localStorage.getItem('finora_api_url') || DEFAULT_API_URL
}

export function setBaseApiUrl(url: string): void {
  localStorage.setItem('finora_api_url', url)
}

// Purge any legacy persistent tokens from localStorage for maximum security
try {
  localStorage.removeItem('finora_admin_token')
} catch (_) {}

export function getToken(): string | null {
  return sessionStorage.getItem('finora_admin_token')
}

export function setToken(token: string): void {
  sessionStorage.setItem('finora_admin_token', token)
  try {
    localStorage.removeItem('finora_admin_token')
  } catch (_) {}
}

export function removeToken(): void {
  sessionStorage.removeItem('finora_admin_token')
  try {
    localStorage.removeItem('finora_admin_token')
  } catch (_) {}
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem('finora_admin_refresh_token')
}

export function setRefreshToken(token: string): void {
  sessionStorage.setItem('finora_admin_refresh_token', token)
}

export function removeRefreshToken(): void {
  sessionStorage.removeItem('finora_admin_refresh_token')
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>
  _isRetry?: boolean
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  // Security: prevent protocol injection or path traversal
  if (endpoint.includes('://') || endpoint.includes('../') || endpoint.includes('..\\')) {
    throw new Error("Xavfsizlik qoidasi buzildi: Yaroqsiz API endpoint")
  }

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

  // 401 Unauthorized handling (with silent refresh)
  if (response.status === 401) {
    if (endpoint.includes('/auth/login')) {
      const errorMsg = resJson?.error || resJson?.message || "Email yoki parol noto'g'ri"
      throw new Error(errorMsg)
    }

    // Try silent refresh if refresh token is available and not already refreshing/retrying
    const rt = getRefreshToken()
    if (rt && !endpoint.includes('/auth/refresh') && !options._isRetry) {
      try {
        const refreshResp = await apiRequest<{ token?: string; access_token?: string; refresh_token?: string }>(
          '/auth/refresh',
          {
            method: 'POST',
            body: JSON.stringify({ refresh_token: rt }),
            _isRetry: true,
          } as RequestOptions
        )

        const newToken = refreshResp?.access_token || refreshResp?.token
        if (newToken) {
          setToken(newToken)
          if (refreshResp.refresh_token) {
            setRefreshToken(refreshResp.refresh_token)
          }
          // Retry the original request once with new token
          return apiRequest<T>(endpoint, {
            ...options,
            _isRetry: true,
          } as RequestOptions)
        }
      } catch (_) {
        // Refresh failed, proceed to full logout
      }
    }

    removeToken()
    removeRefreshToken()
    throw new Error('Sessiya muddati tugadi, qaytadan tizimga kiring')
  }

  if (!response.ok) {
    let errorMsg = resJson?.error || resJson?.message || `Server xatosi: ${response.status}`
    // Mask raw database errors to prevent technical reconnaissance
    if (typeof errorMsg === 'string' && (errorMsg.includes('pq:') || errorMsg.includes('SQL') || errorMsg.includes('syntax error'))) {
      errorMsg = "Serverda so'rovni bajarishda xatolik yuz berdi"
    }
    throw new Error(errorMsg)
  }

  // Go backend wraps all responses in { success: boolean, message?: string, data?: any }
  if (resJson && typeof resJson === 'object' && 'data' in resJson && resJson.data !== undefined) {
    return resJson.data
  }

  return resJson
}

