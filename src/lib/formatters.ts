const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'short',
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatTime(value: string) {
  const [hours, minutes] = value.split(':')

  if (!hours || !minutes) {
    return value
  }

  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function humanizeEnum(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}
