import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { canAccessRoute } from './authorization'
import { getRoleDestination, isOwnerRole } from './auth-utils'
import { useAuth } from './use-auth'

function requiresOwnerOnboarding(user: NonNullable<ReturnType<typeof useAuth>['user']>) {
  return isOwnerRole(user.role) && (!user.studioId || !user.onboardingCompleted)
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (user && requiresOwnerOnboarding(user) && location.pathname !== '/onboarding') {
    return <Navigate replace to="/onboarding" />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    if (user && requiresOwnerOnboarding(user)) {
      return <Navigate replace to="/onboarding" />
    }

    return <Navigate replace to={getRoleDestination(user?.role ?? 'owner')} />
  }

  return <>{children}</>
}

export function AdminOnboardingRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated || !user) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (!isOwnerRole(user.role)) {
    return <Navigate replace to={getRoleDestination(user.role)} />
  }

  if (user.studioId && user.onboardingCompleted) {
    return <Navigate replace to="/dashboard" />
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
