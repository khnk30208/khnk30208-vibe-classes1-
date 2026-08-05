const pad = (value) => String(value).padStart(2, '0')

export const formatDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const formatDateTime = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return `${formatDate(iso)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
