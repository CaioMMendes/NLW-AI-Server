import { fastify } from "fastify";
import { getAllPromptsRoute } from "./routes/get-all-routes";
import { uploadVideoRoute } from "./routes/upload-video";
import "dotenv/config";
const app = fastify();

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);

// const port=process.env.PORT
app.listen({ port: 3555 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
