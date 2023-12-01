import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { createReadStream, unlink } from "node:fs";
import { openai } from "../lib/openai";
import path from "node:path";

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post("/videos/:videoId/transcription", async (req, reply) => {
    try {
      const paramsSchema = z.object({
        videoId: z.string().uuid(),
      });

      const bodySchema = z.object({
        prompt: z.string(),
        AI: z.string(),
      });

      const { videoId } = paramsSchema.parse(req.params);
      const { prompt, AI } = bodySchema.parse(req.body);

      const video = await prisma.video.findUniqueOrThrow({
        where: {
          id: videoId,
        },
      });
      let videoPath;
      if (process.env.MODE === "dev") {
        videoPath = path.resolve(__dirname, "../../tmp", video.path);
      } else {
        videoPath = path.resolve(`/tmp/${video.path}`);
      }

      const audioReadStream = createReadStream(videoPath);
      let transcription;
      if (AI === "chatGpt") {
        const response = await openai.audio.transcriptions.create({
          file: audioReadStream,
          model: "whisper-1",
          language: "pt",
          response_format: "json",
          temperature: 0,
          prompt,
        });

        transcription = response.text;
      } else if (AI === "xenova") {
        try {
          const { pipeline } = await import("@xenova/transformers");
          const transcribe = await pipeline(
            "automatic-speech-recognition",
            "Xenova/whisper-small"
          );
          const transcriptionXenova = await transcribe(audioReadStream, {
            chunk_length_s: 30,
            stride_length_s: 5,
            language: "portuguese",
            task: "transcribe",
          });
          transcription = transcriptionXenova.text;
        } catch (error) {
          console.error("Erro ao importar @xenova/transformers:", error);
          reply.status(500).send({ error: "Erro interno do servidor" });
        }
      }
      unlink(videoPath, () => {});
      await prisma.video.update({
        where: {
          id: videoId,
        },
        data: {
          transcription,
        },
      });

      return { transcription };
    } catch (error) {
      console.log(error);
      return {
        message: "Ocorreu um erro ao tentar gerar a transcrição",
        status: "error",
      };
    }
  });
}
