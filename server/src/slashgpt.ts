import "dotenv/config";
import express from "express";

import path from "path";
import { ChatSession, ChatConfig, ManifestData } from "slashgpt";

export async function streamSlashGPT(callback: (token: string) => void) {
  const config = new ChatConfig(path.resolve(__dirname));
  const session = new ChatSession(config, {} as ManifestData);
  session.append_user_question("日本の歴史について200文字でまとめてください");
  await session.call_loop(() => {}, callback);

  return session.history.messages();
}

export const slashGPTStream = async (req: express.Request, res: express.Response) => {
  console.log("SLASH");
  res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  const callback = (token: string) => {
    if (token) {
      res.write(token)
    }
  };

  try {
    const response = await streamSlashGPT(callback);
    // console.log(response)
    const json_data = JSON.stringify(response);
    res.write("___END___");
    res.write(json_data);
    return res.end();

  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Internal server error" });
  }
};

/*
(async () => {
  for await (const data of streamChatCompletion()) {
    console.log(data);
  }
})()
*/
