import { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma"

export async function getAllPromptsRoute(app: FastifyInstance) {
  try {
    app.get("/prompts", async () => {
      const prompts = await prisma.prompt.findMany()
      return prompts
    })
  } catch (error) {
    console.log(error)
  }
}
