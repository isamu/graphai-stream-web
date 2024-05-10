import "dotenv/config";

import express from "express";
import cors from "cors";

import { chatStream } from "./streaming";
import { slashGPTStream } from "./slashgpt";
import { agentDispatcher } from "./agent_dispatcher";

export const app = express();

const allowedOrigins = ["http://localhost:8080"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(express.json());
app.use(cors(options));


app.post("/api/stream_chat", chatStream);
app.post("/api/stream_slash", slashGPTStream);

app.post("/agents/:agentId", agentDispatcher);

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
