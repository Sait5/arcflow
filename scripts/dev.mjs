import { spawn } from 'node:child_process'
const api = spawn(process.execPath, ['--env-file-if-exists=.env', 'server/index.mjs'], {
  stdio: 'inherit',
})
const vite = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort'],
  { stdio: 'inherit' },
)
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  api.kill()
  vite.kill()
  process.exitCode = code
}
api.on('exit', (code) => stop(code || 0))
vite.on('exit', (code) => stop(code || 0))
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
