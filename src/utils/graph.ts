import { GraphData, NodeData } from "graphai";

const arrays = (num: number) => {
  return new Array(num).fill(undefined);
};
export const randomInt = (num: number) => {
  return Math.floor(Math.random() * num);
};
export const randomInt2 = (num: number) => {
  return Math.floor((1 - Math.random() * Math.random()) * num);
};
const inputAgentNames = ["SqlAgent", "S3Agent", "mailAgent", "PhoneAudioAgent"];

const agentNames = [
  "sqlAgent",
  "sentimentAgent",
  "classifyAgent",
  "websearchAgent",
  "RAG",
  "semanticSearchAgent",
  "supportAgent",
  "salesAnalysisAgent",
  "salesForecastAgent",
  "imageReader",
  "imageAnalysisAgent",
  "dataLakeAgent",
];

export const generateGraph = (staticNode: number = 10, computedNode: number = 50, concurrency: number = 8): GraphData => {
  const nodes: Record<string, NodeData> = {};
  const inputsNode: string[] = [];
  // const outputNode: Record<number, string> = {};

  arrays(staticNode).forEach((__i, k) => {
    const index = Math.floor(Math.random() * inputAgentNames.length);
    const name = inputAgentNames[index] + "_" + k;
    // const name = "static_" + k;
    inputsNode.push(name);
    nodes[name] = {
      value: name,
    };
  });

  arrays(computedNode).forEach((__i, k) => {
    const index = Math.floor(Math.random() * agentNames.length);

    // const name = "node_" + k;
    const name = agentNames[index] + "_" + k;

    const inputs = arrays(randomInt(3) + 1).map(() => {
      const rand = randomInt2(inputsNode.length);
      return ":" + inputsNode[rand];
    });

    // Ensure that all static nodes are used by other nodes
    if (k < staticNode) {
      inputs.push(":" + inputsNode[k]);
    }

    nodes[name] = {
      agent: "streamMockAgent",
      params: {
        duration: randomInt(10) * 400,
        message: "message from " + name,
      },
      priority: Math.random() > 0.5 ? 1 : 0, // 50% will have priority = 1
      inputs,
    };
    inputsNode.push(name);
  });

  return {
    version: 0.3,
    nodes,
    concurrency,
  };
};
