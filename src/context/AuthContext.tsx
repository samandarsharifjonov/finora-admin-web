import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, getToken, removeToken, setToken } from '../lib/api'
import type { AuthResponse, User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(getToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchCurrentUser = async () => {
    try {
      if (!getToken()) {
        setUser(null)
        setIsLoading(false)
        return
      }
      const data = await apiRequest<User>('/auth/me')
      if (data && (data.is_admin || data.is_super_admin)) {
        setUser(data)
      } else {
        // Not an admin
        logout()
      }
    } catch {
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const resp = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          device_name: 'Web Admin Panel',
          device_type: 'web',
          app_version: '1.2.0',
        }),
      })

      if (!resp.token || !resp.user) {
        throw new Error("Serverdan kutilmagan javob qaytdi")
      }

      if (!resp.user.is_admin && !resp.user.is_super_admin) {
        throw new Error("Kechirasiz, ushbu hisobda Admin boshqaruv ruxsati mavjud emas!")
      }

      setToken(resp.token)
      setTokenState(resp.token)
      setUser(resp.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    removeToken()
    setTokenState(null)
    setUser(null)
  }

  const refreshUser = async () => {
    await fetchCurrentUser()
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.is_super_admin) return true
    return user.permissions?.includes(permission) || false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
