const DEFAULT_API_URL = 'http://localhost:8080'
const DEFAULT_APP_BASE_PATH = '/studioflow/'

function resolveEnvValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : fallback
}

export const appConfig = {
  apiUrl: resolveEnvValue(import.meta.env.VITE_API_URL, DEFAULT_API_URL).replace(/\/$/, ''),
  appBasePath: resolveEnvValue(import.meta.env.VITE_APP_BASE_PATH, DEFAULT_APP_BASE_PATH),
  environment: resolveEnvValue(import.meta.env.VITE_APP_ENV, import.meta.env.PROD ? 'production' : 'development'),
}
