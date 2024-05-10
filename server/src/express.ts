import "dotenv/config";

import express from "express";
import cors from "cors";

import { chatStream } from "./streaming";
import { slashGPTStream } from "./slashgpt";

export const app = express();

const allowedOrigins = ["http://localhost:8080"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(express.json());
app.use(cors(options));


app.post("/api/stream_chat", chatStream);
app.post("/api/stream_slash", slashGPTStream);

//app.get("/api/agents/:agentId/docs", agentDocsReq);
//app.get("/api/agents", agentsList);
// app.get("/api/hello", hello_response);

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
