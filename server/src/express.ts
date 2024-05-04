import "dotenv/config";

import express from "express";
import cors from "cors";

// import { GraphAI, AgentFunction } from "graphai";
// import { defaultTestAgents } from "../graphai/agents/agents";
import { chatStream } from "./streaming";
import { slashGPTStream } from "./slashgpt";

const hostName = "https://graphai-demo.web.app";

export const hello_response = async (req: express.Request, res: express.Response) => {
  res.json({ message: "hello" });
};
/*
const agentDispatcher = async (req: express.Request, res: express.Response) => {
  const { params } = req;
  const { agentId } = params;
  const { nodeId, retry, params: agentParams, inputs } = req.body;
  const agent = defaultTestAgents[agentId];
  if (agent === undefined) {
    res.status(404).send("Not found");
    return;
  }
  const result = await agent({
    params: agentParams,
    inputs,
    debugInfo: {
      nodeId,
      retry,
      verbose: false,
    },
    agents: defaultTestAgents,
  });
  res.json(result);
};

const agentsList = async (req: express.Request, res: express.Response) => {
  const agents = Object.keys(defaultTestAgents).map((agent) => {
    return {
      agentId: agent,
      url: hostName + "/api/agents/" + agent,
      apiDoc: hostName + "/api/agents/" + agent + "/docs",
      description: "foo bar",
      author: "satoshi isamu",
      repository: "https://github.com/snakajima/graphai/",
    };
  });
  res.json({ agents });
};

const agentDocsReq = async (req: express.Request, res: express.Response) => {
  const { params } = req;
  const { agentId } = params;
  if (agentDocs[agentId]) {
    return res.json(agentDocs[agentId]);
  }
  return res.json({});
};
*/

export const app = express();

const allowedOrigins = ["http://localhost:8080", hostName];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(express.json());
app.use(cors(options));

//app.post("/api/agents/:agentId", agentDispatcher);

app.post("/api/stream_chat", chatStream);
app.post("/api/stream_slash", slashGPTStream);

// app.get("/api/agents/:agentId/docs", agentDocsReq);
// app.get("/api/agents", agentsList);
// app.get("/api/hello", hello_response);

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
