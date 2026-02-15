import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template TEXT NOT NULL,
    locale TEXT NOT NULL,
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    subject TEXT NOT NULL DEFAULT '',
    html TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK(status IN ('sent', 'error')),
    message_id TEXT,
    error TEXT,
    variables TEXT NOT NULL DEFAULT '{}',
    sent_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`

const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_logs_template ON logs(template)',
  'CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status)',
  'CREATE INDEX IF NOT EXISTS idx_logs_sent_at ON logs(sent_at)',
]

/** Initializes the SQLite database with WAL mode and the logs table */
export function initDatabase(dbPath?: string): Database.Database {
  const path = dbPath ?? resolve(process.cwd(), 'data', 'kuriyr.db')

  // Ensure data directory exists
  mkdirSync(resolve(path, '..'), { recursive: true })

  const db = new Database(path)
  db.pragma('journal_mode = WAL')

  db.exec(CREATE_TABLE)
  for (const idx of CREATE_INDEXES) {
    db.exec(idx)
  }

  return db
}
