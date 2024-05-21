import "dotenv/config";

import express from "express";
import cors from "cors";

import { streamAgentDispatcher, agentDispatcher, agentsList, agentDoc } from "@receptron/graphai_express";

export const app = express();

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


app.post("/agents/stream/:agentId", streamAgentDispatcher());
app.post("/agents/:agentId", agentDispatcher());

app.get("/agents/list", agentsList("http://localhost:8085", "/agents"));
app.get("/agents/:agentId", agentDoc("http://localhost:8085", "/agents"));

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
