import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { canAccessRoute } from './authorization'
import { getRoleDestination } from './auth-utils'
import { useAuth } from './use-auth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate replace to={getRoleDestination(user?.role ?? 'admin')} />
  }

  return <>{children}</>
}

export function RoleRoute({
  allowedSlugs,
  children,
}: {
  allowedSlugs: string[]
  children: ReactNode
}) {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user) {
    return <Navigate replace to="/login" />
  }

  const isAllowed = allowedSlugs.some((slug) => canAccessRoute(user.role, slug))

  if (!isAllowed) {
    return <Navigate replace to={getRoleDestination(user.role)} />
  }

  return <>{children}</>
}
