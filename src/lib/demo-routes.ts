import { appConfig } from './app-config'

const LOCAL_PUBLIC_BOOKING_DEMO_ROUTE = '/book/studioflow-hq/downtown-atelier'

export const PUBLIC_BOOKING_DEMO_ROUTE =
  appConfig.environment === 'production' ? '/guide' : LOCAL_PUBLIC_BOOKING_DEMO_ROUTE
