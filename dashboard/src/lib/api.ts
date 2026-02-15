const BASE_URL = window.location.origin

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LogEntry {
  id: number
  template: string
  locale: string
  recipient: string
  channel: string
  subject: string
  html: string
  status: 'sent' | 'error'
  message_id: string | null
  error: string | null
  variables: string
  sent_at: string
}

interface FetchLogsParams {
  page?: number
  limit?: number
  template?: string
  status?: string
}

export async function fetchLogs(params: FetchLogsParams = {}): Promise<PaginatedResponse<LogEntry>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.template) query.set('template', params.template)
  if (params.status) query.set('status', params.status)

  const res = await fetch(`${BASE_URL}/logs?${query}`)
  return res.json()
}

export async function fetchLog(id: number): Promise<LogEntry> {
  const res = await fetch(`${BASE_URL}/logs/${id}`)
  return res.json()
}
