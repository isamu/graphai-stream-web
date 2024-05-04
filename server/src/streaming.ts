import express from "express";
import OpenAI from "openai";


export async function* streamChatCompletion() {
const openai = new OpenAI();

  const chatStream = await openai.beta.chat.completions.stream({
    messages: [{role:"user", content: "日本の歴史について2000文字でまとめてください"}],
    model: "gpt-3.5-turbo",
    stream: true,
  });
  
  const current = [];
  for await (const message of chatStream) {
    const token = message.choices[0].delta.content;
    current.push(token);
    // console.log(token);
    // console.log(current.join(""))
    if (token) {
      yield token;
    }
  }

  const chatCompletion = await chatStream.finalChatCompletion();
  return chatCompletion;
}


export const chatStream = async (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    for await (const data of streamChatCompletion()) {
      res.write(data);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Internal server error" });
  }
  return res.end();
};
