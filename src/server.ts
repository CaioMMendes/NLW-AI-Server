import { fastify } from "fastify";

const app = fastify();

// const port=process.env.PORT
app.listen({ port: 3555 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
