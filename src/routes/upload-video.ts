import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import fs, { unlink } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { GoogleApis } from "googleapis";
// import { driveUpload } from "../utils/driveUpload";

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, //25mb
    },
  });
  app.post("/videos", async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: "Missing file input." });
      }

      const extension = path.extname(data.filename);
      if (extension !== ".mp3") {
        return reply
          .status(400)
          .send({ error: "Invalid input type, please upload a MP3." });
      }
      const temporaryDir = os.tmpdir();
      const aaa = path.join(process.cwd(), "files", "test.json");
      console.log(temporaryDir);
      console.log(aaa);
      const fileBaseName = path.basename(data.filename, extension);
      const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;
      const uploadDestination = path.resolve(
        __dirname,
        "../../tmp",
        fileUploadName
      );
      // await pump(data.file, fs.createWriteStream(`/tmp/${fileUploadName}`));
      if (process.env.MODE === "dev") {
        console.log("dev");
        await pump(data.file, fs.createWriteStream(uploadDestination));
      } else {
        console.log("prod");
        await pump(data.file, fs.createWriteStream(`/tmp/${fileUploadName}`));
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
      });
      return reply.send(video);
    } catch (error) {
      console.log(error);
    }
  });
}
