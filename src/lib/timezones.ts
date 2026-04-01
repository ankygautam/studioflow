const fallbackTimezones = [
  'America/Edmonton',
  'America/Vancouver',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Halifax',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
]

function getSupportedTimezones(): string[] {
  const intlWithSupportedValues = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[]
  }

  if (typeof intlWithSupportedValues.supportedValuesOf === 'function') {
    return intlWithSupportedValues.supportedValuesOf('timeZone')
  }

  return fallbackTimezones
}

export const timezoneOptions: string[] = getSupportedTimezones()
