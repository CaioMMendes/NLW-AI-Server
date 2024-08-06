import { OpenAIStream, streamToResponse } from "ai"
import { FastifyInstance } from "fastify"
import { z } from "zod"
import { openaiApi } from "../lib/openai"
import { prisma } from "../lib/prisma"
import { allowAccess } from "../server"
// import { ZodTypeProvider } from "fastify-type-provider-zod"

export async function generateAiCompletionRoute(app: FastifyInstance) {
  app
    // .withTypeProvider<ZodTypeProvider>()

    .post(
      "/ai/complete",

      // {
      //   schema: {
      //     tags: ["videos"],
      //     body: z.object({
      //       videoId: z.string().uuid(),
      //       prompt: z.string(),
      //       temperature: z.number().min(0).max(1).default(0.5),
      //       AI: z.string(),
      //     }),
      //     response: {
      //       200: z.object({
      //         response: z.string(),
      //       }),
      //       400: z.object({
      //         error: z.string(),
      //       }),
      //     },
      //   },
      // },

      async (req, reply) => {
        const bodySchema = z.object({
          videoId: z.string().uuid(),
          prompt: z.string(),
          temperature: z.number().min(0).max(1).default(0.5),
          AI: z.string(),
        })

        const { prompt, videoId, temperature, AI } = bodySchema.parse(req.body)

        const video = await prisma.video.findUniqueOrThrow({
          where: {
            id: videoId,
          },
        })
        if (!video.transcription) {
          return reply
            .status(400)
            .send({ error: "Video transcription was not generated yet" })
        }

        const promptMessage = prompt.replace(
          "{transcription}",
          video.transcription
        )
        console.log(prompt)
        console.log(promptMessage)

        if (AI === "chatGpt") {
          const response = await openaiApi.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            temperature,
            messages: [{ role: "user", content: promptMessage }],
            stream: true,
          })
          // const response = await openai.chat.completions.create({
          //   model: "gpt-3.5-turbo-16k",
          //   temperature,
          //   messages: [{ role: "user", content: promptMessage }],
          //   stream: true,
          // });
          console.log("resposne", response)
          const stream = OpenAIStream(response)
          streamToResponse(stream, reply.raw, {
            headers: {
              "Access-Control-Allow-Origin": allowAccess!,
              "Access-Control-Allow-Methods": "POST,GET,PUT,DELETE,OPTIONS",
            },
          })
        }
      }
    )
}
