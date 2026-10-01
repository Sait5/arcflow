import { createServer } from 'node:http'
import { createDatabase } from './database.mjs'
import { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
const hash = (value) => createHash('sha256').update(value).digest('hex')
const derive = promisify(scrypt)
const statuses = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done']
const priorities = ['Urgent', 'High', 'Medium', 'Low']
class ApiError extends Error {
  constructor(status, code) {
    super(code)
    this.status = status
  }
}
function text(value, max, min = 1) {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max)
    throw new ApiError(400, 'invalid_input')
  return value.trim()
}
export function createApp({
  database = process.env.DATA_PATH || 'data/arcflow.sqlite',
  connectionString = process.env.DATABASE_URL,
  origin = process.env.APP_ORIGIN || 'http://127.0.0.1:5174',
  secure = origin.startsWith('https://'),
} = {}) {
  const { db, get, all, run, withRequest } = createDatabase(database, connectionString)
  const publicUser = (u) => ({
    id: u.id,
    name: u.name,
    initials: u.name
      .split(/\s+/)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase(),
    color: 'lavender',
  })
  const issue = (row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee || '',
    project: row.project,
    labels: JSON.parse(row.labels),
    version: row.version,
  })
  const limits = new Map()
  function limit(key, max = 30) {
    const now = Date.now()
    const entry = limits.get(key)
    if (!entry || entry.until < now) limits.set(key, { count: 1, until: now + 900000 })
    else if (++entry.count > max) throw new ApiError(429, 'too_many_requests')
    if (limits.size > 10000) for (const [k, v] of limits) if (v.until < now) limits.delete(k)
  }
  async function member(teamId, userId, owner = false) {
    const m = await get('SELECT role FROM members WHERE team_id=? AND user_id=?', teamId, userId)
    if (!m) throw new ApiError(404, 'team_not_found')
    if (owner && m.role !== 'owner') throw new ApiError(403, 'owner_required')
  }
  async function teams(userId) {
    return await all(
      'SELECT t.id,t.name,m.role FROM teams t JOIN members m ON m.team_id=t.id WHERE m.user_id=? ORDER BY t.id',
      userId,
    )
  }
  async function session(req) {
    const token = /(?:^|;\s*)arcflow_session=([a-f0-9]{64})(?:;|$)/.exec(
      req.headers.cookie || '',
    )?.[1]
    if (!token) return null
    return (
      (await get(
        'SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?',
        hash(token),
        Date.now(),
      )) || null
    )
  }
  async function signIn(res, userId) {
    await run('DELETE FROM sessions WHERE expires<?', Date.now())
    const token = randomBytes(32).toString('hex')
    await run('INSERT INTO sessions VALUES(?,?,?)', hash(token), userId, Date.now() + 604800000)
    res.setHeader(
      'Set-Cookie',
      `arcflow_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure ? '; Secure' : ''}`,
    )
  }
  async function body(req) {
    if (req.body !== undefined) {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      if (Buffer.byteLength(raw) > 32768) throw new ApiError(413, 'payload_too_large')
      try {
        const value = JSON.parse(raw)
        if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error()
        return value
      } catch {
        throw new ApiError(400, 'invalid_input')
      }
    }
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > 32768) throw new ApiError(413, 'payload_too_large')
      chunks.push(chunk)
    }
    try {
      const data = JSON.parse(Buffer.concat(chunks).toString() || '{}')
      if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error()
      return data
    } catch {
      throw new ApiError(400, 'invalid_input')
    }
  }
  async function validateIssue(data, teamId) {
    const value = {
      title: text(data.title, 200),
      description: text(data.description ?? '', 8000, 0),
      status: data.status || 'Todo',
      priority: data.priority || 'Medium',
      assignee: data.assignee || '',
      project: data.project,
      labels: data.labels ?? [],
    }
    if (!statuses.includes(value.status) || !priorities.includes(value.priority))
      throw new ApiError(400, 'invalid_input')
    if (
      !(await get(
        'SELECT id FROM projects WHERE id=? AND team_id=?',
        typeof value.project === 'string' ? value.project : '',
        teamId,
      ))
    )
      throw new ApiError(400, 'invalid_project')
    if (
      value.assignee &&
      !(await get(
        'SELECT user_id FROM members WHERE team_id=? AND user_id=?',
        teamId,
        typeof value.assignee === 'string' ? value.assignee : '',
      ))
    )
      throw new ApiError(400, 'invalid_assignee')
    if (
      !Array.isArray(value.labels) ||
      value.labels.length > 8 ||
      value.labels.some((x) => typeof x !== 'string' || x.length > 40)
    )
      throw new ApiError(400, 'invalid_input')
    return value
  }
  async function api(req, res, path) {
    if (req.method !== 'GET') {
      if (req.headers.origin !== origin) throw new ApiError(403, 'invalid_origin')
      if (!req.headers['content-type']?.startsWith('application/json'))
        throw new ApiError(415, 'json_required')
      limit(`write:${req.socket.remoteAddress}`, 600)
    }
    const user = await session(req)
    if (path === '/api/auth/session' && req.method === 'GET')
      return {
        user: user ? { ...publicUser(user), email: user.email } : null,
        teams: user ? await teams(user.id) : [],
      }
    if (path === '/api/auth/register' && req.method === 'POST') {
      limit(`auth:${req.socket.remoteAddress}`)
      const data = await body(req)
      const name = text(data.name, 80)
      const email = text(data.email, 254).toLowerCase()
      const password = text(data.password, 256, 12)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'invalid_email')
      if (await get('SELECT id FROM users WHERE email=?', email))
        throw new ApiError(409, 'email_in_use')
      const salt = randomBytes(16).toString('hex')
      const key = await derive(password, salt, 64)
      const id = randomUUID()
      try {
        await run(
          'INSERT INTO users VALUES(?,?,?,?)',
          id,
          email,
          name,
          `${salt}:${key.toString('hex')}`,
        )
      } catch {
        throw new ApiError(409, 'email_in_use')
      }
      await signIn(res, id)
      return { user: { ...publicUser({ id, name }), email }, teams: [] }
    }
    if (path === '/api/auth/login' && req.method === 'POST') {
      limit(`auth:${req.socket.remoteAddress}`)
      const data = await body(req)
      const email = text(data.email, 254).toLowerCase()
      const password = text(data.password, 256, 1)
      limit(`account:${hash(email)}`)
      const u = await get('SELECT * FROM users WHERE email=?', email)
      const [salt, expected] = u?.password.split(':') || [
        '00000000000000000000000000000000',
        '0'.repeat(128),
      ]
      const key = await derive(password, salt, 64)
      if (!u || !timingSafeEqual(key, Buffer.from(expected, 'hex')))
        throw new ApiError(401, 'invalid_credentials')
      await signIn(res, u.id)
      return { user: { ...publicUser(u), email: u.email }, teams: await teams(u.id) }
    }
    const invitation = /^\/api\/invites\/([a-f0-9]{64})(?:\/join)?$/.exec(path)
    if (invitation && req.method === 'GET') {
      const entry = await get(
        'SELECT t.name FROM invites i JOIN teams t ON t.id=i.team_id WHERE i.token=? AND i.expires>? AND i.remaining>0',
        hash(invitation[1]),
        Date.now(),
      )
      if (!entry) throw new ApiError(404, 'invite_expired')
      return { name: entry.name }
    }
    if (!user) throw new ApiError(401, 'sign_in_required')
    if (path === '/api/auth/logout' && req.method === 'POST') {
      const token = /arcflow_session=([a-f0-9]{64})/.exec(req.headers.cookie || '')?.[1]
      if (token) await run('DELETE FROM sessions WHERE token=?', hash(token))
      res.setHeader(
        'Set-Cookie',
        `arcflow_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure ? '; Secure' : ''}`,
      )
      return { ok: true }
    }
    if (path === '/api/teams' && req.method === 'GET') return { teams: await teams(user.id) }
    if (path === '/api/teams' && req.method === 'POST') {
      if ((await teams(user.id)).length >= 20) throw new ApiError(400, 'team_limit')
      const name = text((await body(req)).name, 80)
      const id = randomUUID()
      try {
        await run('INSERT INTO teams(id,name,owner) VALUES(?,?,?)', id, name, user.id)
        await run('INSERT INTO members VALUES(?,?,?)', id, user.id, 'owner')
        await run('INSERT INTO projects VALUES(?,?,?,?)', randomUUID(), id, 'General', 'lavender')
      } catch (e) {
        throw e
      }
      return { team: { id, name, role: 'owner' } }
    }
    if (invitation && path.endsWith('/join') && req.method === 'POST') {
      const entry = await get(
        'SELECT * FROM invites WHERE token=? AND expires>? AND remaining>0' +
          (connectionString ? ' FOR UPDATE' : ''),
        hash(invitation[1]),
        Date.now(),
      )
      if (!entry) throw new ApiError(404, 'invite_expired')
      if (
        !(await get(
          'SELECT user_id FROM members WHERE team_id=? AND user_id=?',
          entry.team_id,
          user.id,
        ))
      ) {
        if ((await teams(user.id)).length >= 20) throw new ApiError(400, 'team_limit')
        try {
          await run('INSERT INTO members VALUES(?,?,?)', entry.team_id, user.id, 'member')
          await run('UPDATE invites SET remaining=remaining-1 WHERE token=?', entry.token)
        } catch (e) {
          throw e
        }
      }
      return { team: (await teams(user.id)).find((t) => t.id === entry.team_id) }
    }
    const match = /^\/api\/teams\/([^/]+)\/(workspace|invites|projects|issues)(?:\/([^/]+))?$/.exec(
      path,
    )
    if (!match) throw new ApiError(404, 'not_found')
    const [, teamId, resource, issueId] = match
    await member(teamId, user.id)
    if (resource === 'workspace' && req.method === 'GET')
      return {
        team: (await teams(user.id)).find((t) => t.id === teamId),
        users: (
          await all(
            'SELECT u.id,u.name,m.role FROM users u JOIN members m ON m.user_id=u.id WHERE m.team_id=?',
            teamId,
          )
        ).map((u) => ({ ...publicUser(u), role: u.role })),
        projects: await all(
          'SELECT id,name,color FROM projects WHERE team_id=? ORDER BY id',
          teamId,
        ),
        issues: (
          await all('SELECT * FROM issues WHERE team_id=? ORDER BY updated DESC', teamId)
        ).map(issue),
      }
    if (resource === 'invites' && req.method === 'POST') {
      await member(teamId, user.id, true)
      await run('DELETE FROM invites WHERE expires<? OR team_id=?', Date.now(), teamId)
      const token = randomBytes(32).toString('hex')
      await run(
        'INSERT INTO invites VALUES(?,?,?,?)',
        hash(token),
        teamId,
        Date.now() + 86400000,
        20,
      )
      return { url: `${origin}/invite/${token}` }
    }
    if (resource === 'projects' && req.method === 'POST') {
      const name = text((await body(req)).name, 80)
      const id = randomUUID()
      await run('INSERT INTO projects VALUES(?,?,?,?)', id, teamId, name, 'sage')
      return { project: { id, name, color: 'sage' } }
    }
    if (resource === 'issues' && req.method === 'POST' && !issueId) {
      const value = await validateIssue(await body(req), teamId)
      let id
      try {
        await run('UPDATE teams SET counter=counter+1 WHERE id=?', teamId)
        id = `ARC-${(await get('SELECT counter FROM teams WHERE id=?', teamId)).counter}`
        await run(
          'INSERT INTO issues VALUES(?,?,?,?,?,?,?,?,?,?,?)',
          id,
          teamId,
          value.title,
          value.description,
          value.status,
          value.priority,
          value.assignee || null,
          value.project,
          JSON.stringify(value.labels),
          1,
          Date.now(),
        )
      } catch (e) {
        throw e
      }
      return {
        issue: issue(await get('SELECT * FROM issues WHERE team_id=? AND id=?', teamId, id)),
      }
    }
    if (resource === 'issues' && issueId && req.method === 'PATCH') {
      const current = await get('SELECT * FROM issues WHERE team_id=? AND id=?', teamId, issueId)
      if (!current) throw new ApiError(404, 'issue_not_found')
      const data = await body(req)
      if (data.version !== current.version) throw new ApiError(409, 'issue_conflict')
      const value = await validateIssue({ ...issue(current), ...data }, teamId)
      const changed = await run(
        'UPDATE issues SET title=?,description=?,status=?,priority=?,assignee=?,project=?,labels=?,version=version+1,updated=? WHERE team_id=? AND id=? AND version=?',
        value.title,
        value.description,
        value.status,
        value.priority,
        value.assignee || null,
        value.project,
        JSON.stringify(value.labels),
        Date.now(),
        teamId,
        issueId,
        data.version,
      )
      if (!changed.changes) throw new ApiError(409, 'issue_conflict')
      return {
        issue: issue(await get('SELECT * FROM issues WHERE team_id=? AND id=?', teamId, issueId)),
      }
    }
    if (resource === 'issues' && issueId && req.method === 'DELETE') {
      await run('DELETE FROM issues WHERE team_id=? AND id=?', teamId, issueId)
      return { ok: true }
    }
    throw new ApiError(404, 'not_found')
  }
  const handler = async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'same-origin')
    res.setHeader('X-Frame-Options', 'DENY')
    try {
      const path = new URL(req.url, origin).pathname
      if (path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store')
        const result = await withRequest(() => api(req, res, path))
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(result))
        return
      }
      if (!['GET', 'HEAD'].includes(req.method)) throw new ApiError(404, 'not_found')
      const root = resolve('dist')
      const requested = resolve(root, '.' + decodeURIComponent(path))
      const file =
        requested.startsWith(root + '/') || requested.startsWith(root + '\\') ? requested : root
      const target = existsSync(file) && extname(file) ? file : resolve(root, 'index.html')
      if (!existsSync(target)) throw new ApiError(404, 'frontend_not_built')
      const types = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
        '.png': 'image/png',
      }
      res.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream')
      res.end(req.method === 'HEAD' ? undefined : readFileSync(target))
    } catch (e) {
      res.statusCode = e instanceof ApiError ? e.status : 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: e instanceof ApiError ? e.message : 'server_error' }))
      if (!(e instanceof ApiError)) console.error('API operation failed:', e.name)
    }
  }
  const server = createServer(handler)
  server.requestTimeout = 15000
  return { server, db, handler }
}
