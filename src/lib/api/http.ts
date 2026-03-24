const DEFAULT_API_URL = 'http://localhost:8080'
const AUTH_LOCAL_KEY = 'studioflow-auth-token-local'
const AUTH_SESSION_KEY = 'studioflow-auth-token-session'
const STUDIO_LOCAL_KEY = 'studioflow-auth-studio-local'
const STUDIO_SESSION_KEY = 'studioflow-auth-studio-session'

let authToken =
  typeof window === 'undefined'
    ? null
    : window.localStorage.getItem(AUTH_LOCAL_KEY) ?? window.sessionStorage.getItem(AUTH_SESSION_KEY)

let authStudioId =
  typeof window === 'undefined'
    ? null
    : window.localStorage.getItem(STUDIO_LOCAL_KEY) ?? window.sessionStorage.getItem(STUDIO_SESSION_KEY)

function normalizeBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim()
  const baseUrl = configuredBaseUrl && configuredBaseUrl.length > 0 ? configuredBaseUrl : DEFAULT_API_URL
  return baseUrl.replace(/\/$/, '')
}

export class ApiError extends Error {
  details: unknown
  status: number

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  let response: Response

  try {
    response = await fetch(`${normalizeBaseUrl()}${path}`, {
      ...options,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
    })
  } catch (error) {
    throw new ApiError(
      `Unable to reach the StudioFlow backend at ${normalizeBaseUrl()}. Start the Spring Boot app and database, then try again.`,
      0,
      error,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const rawBody = await response.text()
  const parsedBody = rawBody ? safeJsonParse(rawBody) : null

  if (!response.ok) {
    const message =
      typeof parsedBody === 'object' &&
      parsedBody !== null &&
      'message' in parsedBody &&
      typeof parsedBody.message === 'string'
        ? parsedBody.message
        : `Request failed with status ${response.status}`

    throw new ApiError(message, response.status, parsedBody)
  }

  return parsedBody as T
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export const api = {
  del: (path: string) => request<void>(path, { method: 'DELETE' }),
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { body, method: 'POST' }),
  put: <T>(path: string, body: unknown) => request<T>(path, { body, method: 'PUT' }),
}

export function persistAuthToken(token: string, remember: boolean, studioId?: string | null) {
  authToken = token
  authStudioId = studioId ?? null
  window.localStorage.removeItem(AUTH_LOCAL_KEY)
  window.sessionStorage.removeItem(AUTH_SESSION_KEY)
  window.localStorage.removeItem(STUDIO_LOCAL_KEY)
  window.sessionStorage.removeItem(STUDIO_SESSION_KEY)

  if (remember) {
    window.localStorage.setItem(AUTH_LOCAL_KEY, token)
    if (studioId) {
      window.localStorage.setItem(STUDIO_LOCAL_KEY, studioId)
    }
  } else {
    window.sessionStorage.setItem(AUTH_SESSION_KEY, token)
    if (studioId) {
      window.sessionStorage.setItem(STUDIO_SESSION_KEY, studioId)
    }
  }
}

export function clearAuthToken() {
  authToken = null
  authStudioId = null
  window.localStorage.removeItem(AUTH_LOCAL_KEY)
  window.sessionStorage.removeItem(AUTH_SESSION_KEY)
  window.localStorage.removeItem(STUDIO_LOCAL_KEY)
  window.sessionStorage.removeItem(STUDIO_SESSION_KEY)
}

export function getStoredAuthToken() {
  return authToken
}

export function getDefaultStudioId() {
  const studioId = import.meta.env.VITE_STUDIO_ID?.trim()
  if (studioId && studioId.length > 0) {
    return studioId
  }

  return authStudioId
}
