import { createContext } from 'react'
import type { AuthRole, AuthUser } from './auth-types'

export type LoginInput = {
  email: string
  password: string
  remember: boolean
}

export type RegisterInput = {
  businessName: string
  confirmPassword: string
  email: string
  fullName: string
  password: string
  role: AuthRole
}

export type AuthContextValue = {
  forgotPassword: (email: string) => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<AuthUser>
  logout: () => void
  refreshCurrentUser: () => Promise<void>
  register: (input: RegisterInput) => Promise<AuthUser>
  selectedLocationId: string | null
  setSelectedLocationId: (locationId: string | null) => void
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
