/**
 * Shim that makes better-sqlite3 behave like bun:sqlite for tests.
 * Vitest runs under Node.js and can't resolve bun:sqlite,
 * so we wrap better-sqlite3 to match bun:sqlite's binding conventions.
 *
 * Key difference: bun:sqlite keeps the `$` prefix in binding keys,
 * while better-sqlite3 strips it. This wrapper handles the translation.
 */
import BetterSqlite3 from 'better-sqlite3'

/** Strips `$` prefix from object keys to match better-sqlite3 expectations */
function stripPrefix(params: unknown): unknown {
  if (typeof params !== 'object' || params === null || Array.isArray(params)) return params
  return Object.fromEntries(
    Object.entries(params as Record<string, unknown>).map(([k, v]) => [
      k.startsWith('$') ? k.slice(1) : k,
      v,
    ]),
  )
}

function wrapStatement(stmt: BetterSqlite3.Statement) {
  return {
    run: (params?: unknown) => stmt.run(stripPrefix(params) as Record<string, unknown>),
    get: (params?: unknown) => stmt.get(stripPrefix(params) as Record<string, unknown>),
    all: (params?: unknown) => stmt.all(stripPrefix(params) as Record<string, unknown>),
  }
}

class Database {
  private db: BetterSqlite3.Database

  constructor(path: string) {
    this.db = new BetterSqlite3(path)
  }

  /** Executes raw SQL (DDL, pragmas) */
  exec(sql: string) {
    this.db.exec(sql)
  }

  prepare(sql: string) {
    return wrapStatement(this.db.prepare(sql))
  }
}

export { Database }
