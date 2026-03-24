import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context-object'
import type { AuthUser } from './auth-types'
import { getMockUserFromRole } from './auth-utils'

const AUTH_LOCAL_KEY = 'studioflow-auth-local'
const AUTH_SESSION_KEY = 'studioflow-auth-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const storedUser =
      window.localStorage.getItem(AUTH_LOCAL_KEY) ??
      window.sessionStorage.getItem(AUTH_SESSION_KEY)

    if (!storedUser) {
      return
    }

    try {
      setUser(JSON.parse(storedUser) as AuthUser)
    } catch {
      window.localStorage.removeItem(AUTH_LOCAL_KEY)
      window.sessionStorage.removeItem(AUTH_SESSION_KEY)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      forgotPassword: async () => {
        await wait(300)
      },
      isAuthenticated: Boolean(user),
      login: async ({ email, remember, role }) => {
        await wait(350)

        const nextUser: AuthUser = getMockUserFromRole(role, email)

        window.localStorage.removeItem(AUTH_LOCAL_KEY)
        window.sessionStorage.removeItem(AUTH_SESSION_KEY)

        if (remember) {
          window.localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(nextUser))
        } else {
          window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(nextUser))
        }

        setUser(nextUser)
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_LOCAL_KEY)
        window.sessionStorage.removeItem(AUTH_SESSION_KEY)
        setUser(null)
      },
      register: async ({ businessName, email, fullName, role }) => {
        await wait(350)

        const nextUser: AuthUser = {
          businessName,
          email,
          fullName,
          role,
        }

        window.localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(nextUser))
        setUser(nextUser)
      },
      user,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function wait(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration)
  })
}
