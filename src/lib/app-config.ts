const DEFAULT_APP_BASE_PATH = '/studioflow/'
const isProductionBuild = import.meta.env.PROD

function resolveEnvValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : fallback
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const apiUrl = (configuredApiUrl ?? (isProductionBuild ? '' : 'http://localhost:8080')).replace(/\/$/, '')

export const appConfig = {
  apiUrl,
  appBasePath: resolveEnvValue(import.meta.env.VITE_APP_BASE_PATH, DEFAULT_APP_BASE_PATH),
  environment: resolveEnvValue(import.meta.env.VITE_APP_ENV, import.meta.env.PROD ? 'production' : 'development'),
  isApiConfigured: apiUrl.length > 0,
  isHostedBuildWithoutApi: isProductionBuild && apiUrl.length === 0,
}
