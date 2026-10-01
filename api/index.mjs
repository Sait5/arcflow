import { createApp } from '../server/app.mjs'

let app
export default function handler(req, res) {
  app ??= createApp()
  return app.handler(req, res)
}
