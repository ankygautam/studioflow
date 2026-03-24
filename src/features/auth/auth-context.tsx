import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, login as loginRequest, register as registerRequest } from '../../lib/api/auth-api'
import { clearAuthToken, getStoredAuthToken, persistAuthToken } from '../../lib/api/http'
import { AuthContext, type AuthContextValue } from './auth-context-object'
import type { AuthUser } from './auth-types'
import { mapAuthRoleToBackend, mapBackendRole } from './auth-utils'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!getStoredAuthToken()) {
      setIsLoading(false)
      return
    }

    void getCurrentUser()
      .then((nextUser) => {
        setUser({
          email: nextUser.email,
          fullName: nextUser.fullName,
          id: nextUser.id,
          role: mapBackendRole(nextUser.role),
          studioId: nextUser.studioId,
        })
      })
      .catch(() => {
        clearAuthToken()
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
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
          role: mapBackendRole(response.user.role),
          studioId: response.user.studioId,
        }

        persistAuthToken(response.token, remember, response.user.studioId)
        setUser(nextUser)
        return nextUser
      },
      logout: () => {
        clearAuthToken()
        setUser(null)
      },
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
          role: mapBackendRole(response.user.role),
          studioId: response.user.studioId,
        }

        persistAuthToken(response.token, true, response.user.studioId)
        setUser(nextUser)
        return nextUser
      },
      user,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function wait(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration)
  })
}
