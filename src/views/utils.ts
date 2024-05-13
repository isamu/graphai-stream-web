import { AgentFunctionContext } from "graphai/lib/type";

export async function* streamChatCompletion(url: string, postData: AgentFunctionContext) {
  const { params, inputs, debugInfo, filterParams } = postData;
  const postBody = { params, inputs, debugInfo, filterParams };

  const completion = await fetch(url, {
    headers: {
      "Content-Type": "text/event-stream",
    },
    method: "POST",
    body: JSON.stringify(postBody),
  });

  const reader = completion.body?.getReader();

  if (completion.status !== 200 || !reader) {
    throw new Error("Request failed");
  }

  const decoder = new TextDecoder("utf-8");
  let done = false;
  while (!done) {
    const { done: readDone, value } = await reader.read();
    if (readDone) {
      done = readDone;
      reader.releaseLock();
    } else {
      const token = decoder.decode(value, { stream: true });
      yield token;
    }
  }
}
