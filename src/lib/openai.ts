import { OpenAI } from "openai";
import { Configuration, OpenAIApi } from "openai-edge";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});
export const openaiApi = new OpenAIApi(configuration);
