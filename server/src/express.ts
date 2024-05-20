import "dotenv/config";

import express from "express";
import cors from "cors";

import { chatStream } from "./streaming";
import { slashGPTStream } from "./slashgpt";
import { agentDispatcher } from "./agent_dispatcher";
import { agentList } from "./agent_list";

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

app.post("/api/stream_chat", chatStream);
app.post("/api/stream_slash", slashGPTStream);

app.post("/agents/:agentId", agentDispatcher);
app.get("/agents/list", agentList);

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
