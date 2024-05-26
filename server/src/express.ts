import "dotenv/config";

import express from "express";
import cors from "cors";
import * as agents from "@graphai/agents";

import { agentDispatcher, agentsList, agentDoc } from "@receptron/graphai_express";
import { AgentFunctionInfoDictionary } from "graphai";

export const app = express();

const agentDictionary: AgentFunctionInfoDictionary = agents;
const allowedOrigins = ["http://localhost:8080"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

// this option is for parse json body with text/event-stream
app.use(
  express.json({
    type(req) {
      return true;
    },
  }),
);
app.use(cors(options));


app.get("/agents/list", agentsList(agentDictionary, "http://localhost:8085", "/agents"));
app.get("/agents/:agentId", agentDoc(agentDictionary, "http://localhost:8085", "/agents"));
app.post("/agents/:agentId", agentDispatcher(agentDictionary));

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
