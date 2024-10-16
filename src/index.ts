import app from "./app"
import { VercelRequest, VercelResponse } from "@vercel/node"

export default async (req: VercelRequest, res: VercelResponse) => {
  await app.ready()
  app.server.emit("request", req, res)
}
