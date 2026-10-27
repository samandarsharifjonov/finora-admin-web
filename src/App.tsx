import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PermissionGuard } from './components/PermissionGuard'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Layout } from './components/layout/Layout'

import { LoginPage } from './pages/LoginPage'
import { OverviewPage } from './pages/OverviewPage'
import { UsersPage } from './pages/UsersPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { BroadcastPage } from './pages/BroadcastPage'
import { AdminsPage } from './pages/AdminsPage'
import { TermsPage } from './pages/TermsPage'
import { SupportPage } from './pages/SupportPage'
import { NotFoundPage } from './pages/NotFoundPage'

// Normalize router basename so trailing slash does not break route matching on GitHub Pages
const rawBase = import.meta.env.BASE_URL || '/'
const basename = rawBase.length > 1 && rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase

const DashboardRoute: React.FC = () => {
  const { user, hasPermission } = useAuth()
  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-finora-500 border-t-transparent" />
      </div>
    )
  }

  if (user.is_super_admin || hasPermission('overview.view')) {
    return <OverviewPage />
  }

  // Redirect to first permitted section
  if (hasPermission('users.view')) {
    return <Navigate to="/users" replace />
  }
  if (
    hasPermission('categories.analytics') ||
    hasPermission('devices.analytics') ||
    hasPermission('deletions.analytics')
  ) {
    return <Navigate to="/analytics" replace />
  }
  if (hasPermission('broadcast.send')) {
    return <Navigate to="/notifications" replace />
  }
  if (hasPermission('terms.manage')) {
    return <Navigate to="/terms" replace />
  }
  if (hasPermission('support.chat')) {
    return <Navigate to="/support" replace />
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Xush kelibsiz!
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Sizning hisobingizga hali biron-bir boshqaruv bo'limi biriktirilmagan. Iltimos, Super Admin bilan bog'laning.
      </p>
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter basename={basename}>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardRoute />} />
              <Route
                path="users"
                element={
                  <PermissionGuard permission="users.view">
                    <UsersPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="users/:id"
                element={
                  <PermissionGuard permission="users.view">
                    <UserDetailPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="analytics"
                element={
                  <PermissionGuard
                    permission={[
                      'categories.analytics',
                      'devices.analytics',
                      'deletions.analytics',
                    ]}
                  >
                    <AnalyticsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="notifications"
                element={
                  <PermissionGuard permission="broadcast.send">
                    <BroadcastPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="admins"
                element={
                  <PermissionGuard superAdminOnly>
                    <AdminsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="terms"
                element={
                  <PermissionGuard permission="terms.manage">
                    <TermsPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="support"
                element={
                  <PermissionGuard permission="support.chat">
                    <SupportPage />
                  </PermissionGuard>
                }
              />
              <Route
                path="support/:userId"
                element={
                  <PermissionGuard permission="support.chat">
                    <SupportPage />
                  </PermissionGuard>
                }
              />
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
)
}

export default App
