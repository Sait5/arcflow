import { createApp } from './app.mjs'
const { server, db } = createApp()
const port = Number(process.env.PORT || 3001)
server.listen(port, process.env.HOST || '127.0.0.1', () =>
  console.log(`Arcflow API ready on port ${port}`),
)
function close() {
  server.close(() => {
    db.close()
    process.exit(0)
  })
}
process.on('SIGINT', close)
process.on('SIGTERM', close)
