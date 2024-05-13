import { AgentFilterFunction, AgentFunctionContext } from "graphai/lib/type";
import { streamChatCompletion } from "./utils";

const streamingRequest = async (context: AgentFunctionContext, url: string, postData: AgentFunctionContext) => {
  const generator = streamChatCompletion(url, postData);

  const messages = [];
  for await (const token of generator) {
    console.log(token);
    // callback to stream filter
    if (token) {
      messages.push(token);
      if (messages.join("").indexOf("___END___") === -1 && context.filterParams.streamTokenCallback) {
        context.filterParams.streamTokenCallback(token);
      }
    }
  }
  
  const payload_data = messages.join("").split("___END___")[1];
  const data = JSON.parse(payload_data);
  return data;
};
const httpRequest = async (url: string, postData: AgentFunctionContext) => {
  // http
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });
  return await response.json();
};

export const httpAgentFilter: AgentFilterFunction = async (context, next) => {
  const { params, inputs, debugInfo, filterParams } = context;
  if (filterParams?.server) {
    const { baseUrl } = filterParams.server;
    const agentId = debugInfo.agentId;
    const url = baseUrl + agentId;
    const isStreaming = filterParams.streamTokenCallback !== undefined;

    const postData = {
      params,
      inputs,
      debugInfo,
      filterParams,
    };
    if (isStreaming) {
      return await streamingRequest(context, url, postData);
    }
    return await httpRequest(url, postData);
  }
  return next(context);
};

export const streamAgentFilterBuilder = <T>(callback: (context: AgentFunctionContext, data: T) => void) => {
  const streamAgentFilter: AgentFilterFunction = async (context, next) => {
    context.filterParams.streamTokenCallback = (data: T) => {
      callback(context, data);
    };
    return next(context);
  };
  return streamAgentFilter;
};
