function escapeCsvValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

export function buildCsv(columns: string[], rows: Array<Array<string | number | boolean | null | undefined>>) {
  return [
    columns.map((column) => escapeCsvValue(column)).join(','),
    ...rows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')),
  ].join('\n')
}

export function downloadCsv(
  filename: string,
  columns: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
) {
  const csv = buildCsv(columns, rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function buildCsvFilename(prefix: string) {
  const date = new Date().toISOString().slice(0, 10)
  return `${prefix}-${date}.csv`
}
