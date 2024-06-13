import "dotenv/config";

import express from "express";
import cors from "cors";
import * as agents from "@graphai/agents";

import { agentDispatcher, agentsList, agentDoc } from "@receptron/graphai_express";

export const app = express();

const allowedOrigins = ["http://localhost:8080"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

// this option is for parse json body with text/event-stream
app.use(
  express.json({
    type(__req) {
      return true;
    },
  }),
);
app.use(cors(options));


app.get("/agents/list", agentsList(agents, "http://localhost:8085", "/agents"));
app.get("/agents/:agentId", agentDoc(agents, "http://localhost:8085", "/agents"));
app.post("/agents/:agentId", agentDispatcher(agents));

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
