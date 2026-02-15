import type Database from 'better-sqlite3'

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

export interface InsertLog {
  template: string
  locale: string
  recipient: string
  channel?: string
  subject: string
  html: string
  status: 'sent' | 'error'
  message_id?: string
  error?: string
  variables: Record<string, string>
}

export interface LogsRepository {
  insert(log: InsertLog): LogEntry
  findById(id: number): LogEntry | undefined
  findAll(params: { page: number; limit: number; template?: string; status?: string }): LogEntry[]
  count(params: { template?: string; status?: string }): number
}

export function createLogsRepository(db: Database.Database): LogsRepository {
  const insertStmt = db.prepare(`
    INSERT INTO logs (template, locale, recipient, channel, subject, html, status, message_id, error, variables)
    VALUES (@template, @locale, @recipient, @channel, @subject, @html, @status, @messageId, @error, @variables)
  `)

  const findByIdStmt = db.prepare('SELECT * FROM logs WHERE id = ?')

  return {
    insert(log: InsertLog): LogEntry {
      const result = insertStmt.run({
        template: log.template,
        locale: log.locale,
        recipient: log.recipient,
        channel: log.channel ?? 'email',
        subject: log.subject,
        html: log.html,
        status: log.status,
        messageId: log.message_id ?? null,
        error: log.error ?? null,
        variables: JSON.stringify(log.variables),
      })
      return findByIdStmt.get(result.lastInsertRowid) as LogEntry
    },

    findById(id: number): LogEntry | undefined {
      return findByIdStmt.get(id) as LogEntry | undefined
    },

    findAll({ page, limit, template, status }) {
      const conditions: string[] = []
      const params: Record<string, unknown> = {}

      if (template) {
        conditions.push('template = @template')
        params.template = template
      }
      if (status) {
        conditions.push('status = @status')
        params.status = status
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      const offset = (page - 1) * limit

      const stmt = db.prepare(
        `SELECT * FROM logs ${where} ORDER BY sent_at DESC LIMIT @limit OFFSET @offset`,
      )
      return stmt.all({ ...params, limit, offset }) as LogEntry[]
    },

    count({ template, status }) {
      const conditions: string[] = []
      const params: Record<string, unknown> = {}

      if (template) {
        conditions.push('template = @template')
        params.template = template
      }
      if (status) {
        conditions.push('status = @status')
        params.status = status
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      const stmt = db.prepare(`SELECT COUNT(*) as count FROM logs ${where}`)
      const row = stmt.get(params) as { count: number }
      return row.count
    },
  }
}
