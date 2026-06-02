export interface CsvColumn<T> {
  header: string
  value: (item: T) => unknown
}

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) return ''
  const text = value instanceof Date ? value.toISOString() : String(value)
  const escaped = text.replace(/"/g, '""')
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
}

export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const headerLine = columns.map(column => escapeCsvValue(column.header)).join(',')
  const bodyLines = rows.map(row =>
    columns.map(column => escapeCsvValue(column.value(row))).join(',')
  )

  const csv = [headerLine, ...bodyLines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

