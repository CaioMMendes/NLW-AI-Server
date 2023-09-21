import fs from "node:fs";
import { google } from "googleapis";
import path from "node:path";

export async function driveUpload(name: string) {
  try {
    const privateKey = process.env.PRIVATE_KEY!.replace(/\n/g, "\\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        type: process.env.TYPE!,
        private_key: process.env.PRIVATE_KEY!.replace(/\n/g, "\n"),
        universe_domain: process.env.UNIVERSE_DOMAIN,
      },
      projectId: process.env.PROJECT_ID,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const driveService = google.drive({
      version: "v3",
      auth,
    });
    const fileMetaData = {
      name: name,
      parents: [process.env.GOOGLE_API_FOLDER_ID!],
    };
    const readDestination = path.resolve(__dirname, "../../tmp", name);

    const media = {
      mimeType: "audio/mpeg",
      body: fs.createReadStream(readDestination),
    };
    const response = await driveService.files.create({
      requestBody: fileMetaData,
      media: media,
      fields: "id",
    });
    return response.data.id;
  } catch (error) {
    console.log(error);
  }
}
