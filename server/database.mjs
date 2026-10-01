import { DatabaseSync } from 'node:sqlite'
import { AsyncLocalStorage } from 'node:async_hooks'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import pg from 'pg'

const schema = `
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE CASCADE, expires BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner TEXT REFERENCES users(id), counter INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS members (team_id TEXT REFERENCES teams(id) ON DELETE CASCADE, user_id TEXT REFERENCES users(id) ON DELETE CASCADE, role TEXT NOT NULL, PRIMARY KEY(team_id,user_id));
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, team_id TEXT REFERENCES teams(id) ON DELETE CASCADE, name TEXT NOT NULL, color TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS issues (id TEXT NOT NULL, team_id TEXT REFERENCES teams(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL, assignee TEXT REFERENCES users(id), project TEXT REFERENCES projects(id), labels TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, updated BIGINT NOT NULL, PRIMARY KEY(team_id,id));
CREATE TABLE IF NOT EXISTS invites (token TEXT PRIMARY KEY, team_id TEXT REFERENCES teams(id) ON DELETE CASCADE, expires BIGINT NOT NULL, remaining INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE INDEX IF NOT EXISTS issues_team_updated ON issues(team_id,updated);
CREATE INDEX IF NOT EXISTS projects_team ON projects(team_id);
CREATE INDEX IF NOT EXISTS members_user ON members(user_id);
`

export function createDatabase(database, connectionString) {
  if (!connectionString) {
    if (process.env.VERCEL) throw new Error('DATABASE_URL is required on Vercel')
    if (database !== ':memory:') mkdirSync(dirname(resolve(database)), { recursive: true })
    const db = new DatabaseSync(database)
    db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;')
    db.exec(schema)
    let queue = Promise.resolve()
    return {
      db,
      get: async (sql, ...args) => db.prepare(sql).get(...args),
      all: async (sql, ...args) => db.prepare(sql).all(...args),
      run: async (sql, ...args) => db.prepare(sql).run(...args),
      withRequest(operation) {
        const result = queue.then(async () => {
          db.exec('BEGIN IMMEDIATE')
          try {
            const value = await operation()
            db.exec('COMMIT')
            return value
          } catch (error) {
            db.exec('ROLLBACK')
            throw error
          }
        })
        queue = result.catch(() => {})
        return result
      },
    }
  }
  const pool = new pg.Pool({
    connectionString,
    max: 4,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  })
  pool.on('error', () => console.error('Database connection failed'))
  const context = new AsyncLocalStorage()
  let initialization
  function initialize() {
    if (!initialization)
      initialization = (async () => {
        const client = await pool.connect()
        try {
          await client.query('BEGIN')
          await client.query('SELECT pg_advisory_xact_lock(173684201)')
          await client.query(schema)
          await client.query('COMMIT')
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        } finally {
          client.release()
        }
      })().catch((error) => {
        initialization = undefined
        throw error
      })
    return initialization
  }
  async function query(sql, args) {
    let index = 0
    const parameterized = sql.replace(/\?/g, () => `$${++index}`)
    return context.getStore().query(parameterized, args)
  }
  return {
    db: { close: () => pool.end() },
    get: async (sql, ...args) => (await query(sql, args)).rows[0],
    all: async (sql, ...args) => (await query(sql, args)).rows,
    run: async (sql, ...args) => ({ changes: (await query(sql, args)).rowCount }),
    async withRequest(operation) {
      await initialize()
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const value = await context.run(client, operation)
        await client.query('COMMIT')
        return value
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
  }
}
