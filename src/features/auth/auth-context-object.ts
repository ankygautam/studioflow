import { createContext } from 'react'
import type { AuthRole, AuthUser } from './auth-types'

export type LoginInput = {
  email: string
  password: string
  remember: boolean
  role: AuthRole
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
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => void
  register: (input: RegisterInput) => Promise<void>
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
