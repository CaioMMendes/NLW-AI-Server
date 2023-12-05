import { fastify } from "fastify";
import { getAllPromptsRoute } from "./routes/get-all-routes";
import { uploadVideoRoute } from "./routes/upload-video";
import "dotenv/config";
import { createTranscriptionRoute } from "./routes/create-transcription";
import { generateAiCompletionRoute } from "./routes/generate-ai-completion";
import { fastifyCors } from "@fastify/cors";
const app = fastify();

export const allowAccess =
  process.env.MODE === "dev" ? "*" : process.env.URL_ACCESS;

app.register(fastifyCors, {
  origin: allowAccess,
});
app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateAiCompletionRoute);

const port = +process.env.PORT!;
app.listen({ host: "0.0.0.0", port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
