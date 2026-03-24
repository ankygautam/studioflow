import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, login as loginRequest, register as registerRequest } from '../../lib/api/auth-api'
import {
  clearAuthToken,
  getDefaultLocationId,
  getStoredAuthToken,
  persistAuthToken,
  persistSelectedLocationId,
} from '../../lib/api/http'
import { AuthContext, type AuthContextValue } from './auth-context-object'
import type { AuthUser } from './auth-types'
import { mapAuthRoleToBackend, mapBackendRole } from './auth-utils'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLocationId, setSelectedLocationIdState] = useState<string | null>(getDefaultLocationId())

  const applyUser = useCallback((nextUser: {
    email: string
    fullName: string
    id: string
    locationId: string | null
    onboardingCompleted: boolean
    role: ReturnType<typeof mapBackendRole>
    studioId: string | null
  }) => {
    setUser(nextUser)
    const nextLocationId = nextUser.locationId ?? null
    setSelectedLocationIdState((current) => current ?? nextLocationId)
    if (!selectedLocationId && nextLocationId) {
      persistSelectedLocationId(nextLocationId)
    }
  }, [selectedLocationId])

  const refreshCurrentUser = useCallback(async () => {
    const nextUser = await getCurrentUser()
    applyUser({
      email: nextUser.email,
      fullName: nextUser.fullName,
      id: nextUser.id,
      locationId: nextUser.locationId,
      onboardingCompleted: nextUser.onboardingCompleted,
      role: mapBackendRole(nextUser.role),
      studioId: nextUser.studioId,
    })
  }, [applyUser])

  useEffect(() => {
    if (!getStoredAuthToken()) {
      setIsLoading(false)
      return
    }

    void refreshCurrentUser()
      .catch(() => {
        clearAuthToken()
        setUser(null)
        setSelectedLocationIdState(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [refreshCurrentUser])

  const setSelectedLocationId = useCallback((locationId: string | null) => {
    setSelectedLocationIdState(locationId)
    persistSelectedLocationId(locationId)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      forgotPassword: async () => {
        await wait(300)
      },
      isLoading,
      isAuthenticated: Boolean(user),
      login: async ({ email, password, remember }) => {
        const response = await loginRequest({ email, password })
        const nextUser: AuthUser = {
          email: response.user.email,
          fullName: response.user.fullName,
          id: response.user.id,
          locationId: response.user.locationId,
          onboardingCompleted: response.user.onboardingCompleted,
          role: mapBackendRole(response.user.role),
          studioId: response.user.studioId,
        }

        persistAuthToken(response.token, remember, response.user.studioId, response.user.locationId)
        setUser(nextUser)
        setSelectedLocationIdState(response.user.locationId)
        return nextUser
      },
      logout: () => {
        clearAuthToken()
        setUser(null)
        setSelectedLocationIdState(null)
      },
      refreshCurrentUser,
      register: async ({ email, fullName, password, role }) => {
        const response = await registerRequest({
          email,
          fullName,
          password,
          role: mapAuthRoleToBackend(role),
        })
        const nextUser: AuthUser = {
          email: response.user.email,
          fullName: response.user.fullName,
          id: response.user.id,
          locationId: response.user.locationId,
          onboardingCompleted: response.user.onboardingCompleted,
          role: mapBackendRole(response.user.role),
          studioId: response.user.studioId,
        }

        persistAuthToken(response.token, true, response.user.studioId, response.user.locationId)
        setUser(nextUser)
        setSelectedLocationIdState(response.user.locationId)
        return nextUser
      },
      selectedLocationId,
      setSelectedLocationId,
      user,
    }),
    [isLoading, refreshCurrentUser, selectedLocationId, setSelectedLocationId, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function wait(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration)
  })
}
