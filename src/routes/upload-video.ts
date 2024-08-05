import { fastifyMultipart } from "@fastify/multipart"
import { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { pipeline } from "node:stream"
import { promisify } from "node:util"
import { prisma } from "../lib/prisma"

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, //25mb
    },
  })
  app
    // .withTypeProvider<ZodTypeProvider>()

    .post(
      "/videos",

      // {
      //   schema: {
      //     tags: ["videos"],
      //     consumes: ["multipart/form-data"],

      //     body: z.object({
      //       file: z.instanceof(File),
      //     }),
      //     response: {
      //       200: z.object({
      //         id: z.string(),
      //         name: z.string(),
      //         path: z.string(),
      //         transcription: z.string().nullable(),
      //         createdAt: z.date(),
      //       }),
      //       400: z.object({
      //         error: z.string(),
      //       }),
      //     },
      //   },
      // },
      //todo Tá bugado o envio de arquivos do fastify-swagger-ui
      // {
      //   schema: {
      //     consumes: ["multipart/form-data"],
      //     body: {
      //       type: "object",
      //       required: ["file"],
      //       properties: {
      //         file: { type: "string", format: "binary" },
      //       },
      //     },

      //     response: {
      //       200: {
      //         type: "object",
      //         properties: {
      //           filename: { type: "string" },
      //           mimetype: { type: "string" },
      //         },
      //       },
      //     },
      //   },
      // },
      async (request, reply) => {
        try {
          const data = await request.file()
          if (!data) {
            return reply.status(400).send({ error: "Missing file input." })
          }

          const extension = path.extname(data.filename)
          if (extension !== ".mp3") {
            return reply
              .status(400)
              .send({ error: "Invalid input type, please upload a MP3." })
          }

          const fileBaseName = path.basename(data.filename, extension)
          const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
          const uploadDestination = path.resolve(
            __dirname,
            "../../tmp",
            fileUploadName
          )
          // await pump(data.file, fs.createWriteStream(`/tmp/${fileUploadName}`));
          if (process.env.MODE === "dev") {
            console.log("dev")
            await pump(data.file, fs.createWriteStream(uploadDestination))
          } else {
            console.log("prod")
            await pump(
              data.file,
              fs.createWriteStream(`/tmp/${fileUploadName}`)
            )
          }

          // const url = await driveUpload(fileUploadName);

          // unlink(`${__dirname}/../../tmp/${fileUploadName}`, () => {});
          // if (!url) {
          //   return reply.status(400).send({ error: "Need a vídeo url" });
          // }
          const video = await prisma.video.create({
            data: {
              name: data.filename,
              // path: url,
              path: fileUploadName,
            },
          })
          return reply.send(video)
        } catch (error) {
          console.log(error)
        }
      }
    )
}
