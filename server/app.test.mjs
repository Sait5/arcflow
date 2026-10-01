import { test } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from './app.mjs'
const origin = 'http://127.0.0.1:5174'
async function fixture(database = ':memory:') {
  const app = createApp({ database, origin })
  app.server.listen(0, '127.0.0.1')
  await once(app.server, 'listening')
  const base = `http://127.0.0.1:${app.server.address().port}`
  function client() {
    let cookie = ''
    return async (path, method = 'GET', data, options = {}) => {
      const response = await fetch(base + '/api' + path, {
        method,
        headers: {
          Origin: options.origin || origin,
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: data === undefined ? undefined : JSON.stringify(data),
      })
      if (response.headers.get('set-cookie'))
        cookie = response.headers.get('set-cookie').split(';')[0]
      return {
        status: response.status,
        data: await response.json(),
        cookie: response.headers.get('set-cookie'),
      }
    }
  }
  return {
    ...app,
    client,
    close: async () => {
      app.server.closeAllConnections()
      await new Promise((r) => app.server.close(r))
      app.db.close()
    },
  }
}
async function register(client, name) {
  const result = await client('/auth/register', 'POST', {
    name,
    email: `${name.toLowerCase()}@example.test`,
    password: 'Long-test-password!123',
  })
  assert.equal(result.status, 200)
  assert.match(result.cookie, /HttpOnly/)
  assert.match(result.cookie, /SameSite=Lax/)
  return result.data.user
}
test('registration, private teams, invitation, shared changes, conflict protection and logout', async () => {
  const app = await fixture()
  try {
    const alice = app.client(),
      bob = app.client(),
      outsider = app.client()
    const a = await register(alice, 'Alice')
    const b = await register(bob, 'Bob')
    await register(outsider, 'Outsider')
    const created = await alice('/teams', 'POST', { name: 'Product team' })
    assert.equal(created.status, 200)
    const team = created.data.team
    assert.equal((await bob(`/teams/${team.id}/workspace`)).status, 404)
    const workspace = (await alice(`/teams/${team.id}/workspace`)).data
    const task = await alice(`/teams/${team.id}/issues`, 'POST', {
      title: 'Ship onboarding',
      description: 'First step',
      project: workspace.projects[0].id,
      assignee: a.id,
    })
    assert.equal(task.status, 200)
    assert.equal(task.data.issue.id, 'ARC-1')
    const link = (await alice(`/teams/${team.id}/invites`, 'POST', {})).data.url
    const token = link.split('/').pop()
    assert.equal((await bob(`/invites/${token}`)).data.name, 'Product team')
    assert.equal((await bob(`/invites/${token}/join`, 'POST', {})).status, 200)
    const bobWorkspace = (await bob(`/teams/${team.id}/workspace`)).data
    assert.equal(bobWorkspace.issues[0].title, 'Ship onboarding')
    assert.equal(bobWorkspace.users.length, 2)
    const edit = await bob(`/teams/${team.id}/issues/ARC-1`, 'PATCH', {
      version: 1,
      status: 'Done',
      assignee: b.id,
    })
    assert.equal(edit.status, 200)
    assert.equal(edit.data.issue.version, 2)
    assert.equal((await alice(`/teams/${team.id}/workspace`)).data.issues[0].status, 'Done')
    assert.equal(
      (await alice(`/teams/${team.id}/issues/ARC-1`, 'PATCH', { version: 1, status: 'Review' }))
        .status,
      409,
    )
    assert.equal((await outsider(`/teams/${team.id}/workspace`)).status, 404)
    assert.equal(
      (
        await outsider(`/teams/${team.id}/issues/ARC-1`, 'PATCH', {
          version: 2,
          title: 'Intrusion',
        })
      ).status,
      404,
    )
    assert.equal((await outsider(`/teams/${team.id}/issues/ARC-1`, 'DELETE', {})).status, 404)
    assert.equal((await bob(`/teams/${team.id}/invites`, 'POST', {})).status, 403)
    const otherTeam = (await outsider('/teams', 'POST', { name: 'Other team' })).data.team
    const otherProject = (await outsider(`/teams/${otherTeam.id}/workspace`)).data.projects[0]
    assert.equal(
      (
        await alice(`/teams/${team.id}/issues/ARC-1`, 'PATCH', {
          version: 2,
          project: otherProject.id,
        })
      ).status,
      400,
    )
    assert.equal(
      (
        await alice(`/teams/${team.id}/issues/ARC-1`, 'PATCH', {
          version: 2,
          assignee: 'someone-else',
        })
      ).status,
      400,
    )
    await alice(`/teams/${team.id}/invites`, 'POST', {})
    assert.equal((await bob(`/invites/${token}`)).status, 404)
    assert.equal((await bob(`/teams/${team.id}/issues/ARC-1`, 'DELETE', {})).status, 200)
    assert.equal((await alice(`/teams/${team.id}/workspace`)).data.issues.length, 0)
    await bob('/auth/logout', 'POST', {})
    assert.equal((await bob('/auth/session')).data.user, null)
    assert.equal((await bob(`/teams/${team.id}/workspace`)).status, 401)
    const stored = app.db.prepare('SELECT password FROM users WHERE id=?').get(a.id).password
    assert.ok(!stored.includes('Long-test-password'))
    assert.match(stored, /^[a-f0-9]+:[a-f0-9]+$/)
  } finally {
    await app.close()
  }
})
test('validation, CSRF origin, expired invitation and failed sign-in', async () => {
  const app = await fixture()
  try {
    const client = app.client()
    assert.equal((await client('/teams', 'POST', { name: 'X' })).status, 401)
    assert.equal(
      (
        await client('/auth/register', 'POST', {
          name: 'Test',
          email: 'not-email',
          password: 'short',
        })
      ).status,
      400,
    )
    await register(client, 'Test')
    assert.equal(
      (await client('/teams', 'POST', { name: 'Evil' }, { origin: 'https://other.example' }))
        .status,
      403,
    )
    const team = (await client('/teams', 'POST', { name: 'Test team' })).data.team
    const token = (await client(`/teams/${team.id}/invites`, 'POST', {})).data.url.split('/').pop()
    app.db.prepare('UPDATE invites SET expires=0').run()
    assert.equal((await client(`/invites/${token}`)).status, 404)
    await client('/auth/logout', 'POST', {})
    assert.equal(
      (await client('/auth/login', 'POST', { email: 'test@example.test', password: 'wrong' }))
        .status,
      401,
    )
    assert.equal(
      (
        await client('/auth/login', 'POST', {
          email: 'test@example.test',
          password: 'Long-test-password!123',
        })
      ).status,
      200,
    )
    assert.equal(
      (
        await client('/auth/register', 'POST', {
          name: 'Again',
          email: 'test@example.test',
          password: 'Long-test-password!123',
        })
      ).status,
      409,
    )
  } finally {
    await app.close()
  }
})
test('accounts and tasks survive a server restart', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'arcflow-test-'))
  const database = join(directory, 'test.sqlite')
  let app = await fixture(database)
  try {
    let client = app.client()
    await register(client, 'Persistent')
    const team = (await client('/teams', 'POST', { name: 'Persistent team' })).data.team
    const project = (await client(`/teams/${team.id}/workspace`)).data.projects[0]
    await client(`/teams/${team.id}/issues`, 'POST', {
      title: 'Keep this task',
      project: project.id,
    })
    await app.close()
    app = await fixture(database)
    client = app.client()
    await client('/auth/login', 'POST', {
      email: 'persistent@example.test',
      password: 'Long-test-password!123',
    })
    assert.equal(
      (await client(`/teams/${team.id}/workspace`)).data.issues[0].title,
      'Keep this task',
    )
  } finally {
    await app.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
