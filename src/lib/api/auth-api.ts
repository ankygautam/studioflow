import { api } from './http'

export type BackendUserRole = 'ADMIN' | 'CUSTOMER' | 'OWNER' | 'RECEPTIONIST' | 'STAFF'

export type AuthUserResponse = {
  email: string
  fullName: string
  id: string
  locationId: string | null
  onboardingCompleted: boolean
  role: BackendUserRole
  studioId: string | null
  studioName: string | null
}

export type AuthResponse = {
  token: string
  user: AuthUserResponse
}

export function login(payload: { email: string; password: string }) {
  return api.post<AuthResponse>('/api/auth/login', payload)
}

export function register(payload: {
  email: string
  fullName: string
  password: string
  studioName: string
}) {
  return api.post<AuthResponse>('/api/auth/register', payload)
}

export function getCurrentUser() {
  return api.get<AuthUserResponse>('/api/auth/me')
}
