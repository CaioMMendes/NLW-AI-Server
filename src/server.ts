import { fastify } from "fastify"
import { getAllPromptsRoute } from "./routes/get-all-routes"
import { uploadVideoRoute } from "./routes/upload-video"
import "dotenv/config"
import { createTranscriptionRoute } from "./routes/create-transcription"
import { generateAiCompletionRoute } from "./routes/generate-ai-completion"
import { fastifyCors } from "@fastify/cors"
// import fastifySwagger from "@fastify/swagger"
// import fastifySwaggerUI from "@fastify/swagger-ui"
// import {
//   serializerCompiler,
//   validatorCompiler,
//   jsonSchemaTransform,
//   ZodTypeProvider,
// } from "fastify-type-provider-zod"

const app = fastify({})
/* .withTypeProvider<ZodTypeProvider>() */

// app.register(fastifySwagger, {
//   swagger: {
//     consumes: ["application/json", "multipart/form-data"],
//     produces: ["application/json"],
//     info: {
//       title: "AI-Video-Tools",
//       description: "AI Video Tools Server",
//       version: "1.0.0",
//     },
//   },
//   transform: jsonSchemaTransform,
// })

// app.register(fastifySwaggerUI, {
//   routePrefix: "/docs",
// })

// app.setValidatorCompiler(validatorCompiler)
// app.setSerializerCompiler(serializerCompiler)

export const allowAccess =
  process.env.MODE === "dev" ? "*" : process.env.URL_ACCESS

app.register(fastifyCors, {
  origin: allowAccess,
})
app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(generateAiCompletionRoute)

const port = process.env.PORT ? +process.env.PORT : undefined
app.listen({ port }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

const start = async () => {
  const port = process.env.PORT ? +process.env.PORT : undefined
  app.listen({ port }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}

start()

// export default app
