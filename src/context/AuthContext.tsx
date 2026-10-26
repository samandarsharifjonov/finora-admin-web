import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, getToken, removeToken, setToken } from '../lib/api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithQr: (token: string, user: User) => void
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
      const data = await apiRequest<any>('/auth/me')
      const userData = data?.data || data
      const canAccessAdmin = userData && (userData.is_super_admin || userData.permissions?.includes('admin_panel.access'))
      if (canAccessAdmin) {
        setUser(userData)
      } else {
        // Not authorized for admin panel
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
      const resp = await apiRequest<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          device_name: 'Web Admin Panel',
          device_type: 'web',
          app_version: '1.2.0',
        }),
      })

      const authData = resp?.data || resp
      const token = authData?.token
      const user = authData?.user

      if (!token || !user) {
        throw new Error("Serverdan kutilmagan javob qaytdi")
      }

      if (!user.is_admin && !user.is_super_admin) {
        throw new Error("Kechirasiz, ushbu hisobda Admin boshqaruv ruxsati mavjud emas!")
      }

      const hasAdminPanelAccess = user.is_super_admin || user.permissions?.includes('admin_panel.access')
      if (!hasAdminPanelAccess) {
        throw new Error("Kechirasiz, sizga Admin panelga kirish ruxsati berilmagan!")
      }

      try {
        sessionStorage.removeItem('finora_screen_locked')
        localStorage.removeItem('finora_screen_locked')
        localStorage.setItem('finora_last_activity', Date.now().toString())
      } catch (_) {}

      setToken(token)
      setTokenState(token)
      setUser(user)
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithQr = (token: string, user: User) => {
    const hasAdminPanelAccess = user.is_super_admin || user.permissions?.includes('admin_panel.access')
    if (!hasAdminPanelAccess) {
      throw new Error("Kechirasiz, sizga Admin panelga kirish ruxsati berilmagan!")
    }
    try {
      sessionStorage.removeItem('finora_screen_locked')
      localStorage.removeItem('finora_screen_locked')
      localStorage.setItem('finora_last_activity', Date.now().toString())
    } catch (_) {}
    setToken(token)
    setTokenState(token)
    setUser(user)
  }

  const logout = () => {
    removeToken()
    try {
      sessionStorage.removeItem('finora_screen_locked')
      localStorage.removeItem('finora_screen_locked')
      localStorage.removeItem('finora_last_activity')
    } catch (_) {}
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
        loginWithQr,
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
