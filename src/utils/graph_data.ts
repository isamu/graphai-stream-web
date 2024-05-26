const graph_data1 = {
  version: 0.3,
  loop: {
    while: ":people",
  },
  nodes: {
    people: {
      value: ["Steve Jobs", "Elon Musk", "Nikola Tesla"],
      update: ":retriever.array",
    },
    result: {
      value: [],
      update: ":reducer2",
      isResult: true,
    },
    retriever: {
      agent: "shiftAgent",
      inputs: [":people"],
    },
    query: {
      agent: "slashGPTAgent",
      params: {
        manifest: {
          model: "gpt-3.5-turbo",
          prompt: "Describe about the person in less than 100 words",
        },
      },
      inputs: [":retriever.item"],
    },
    reducer1: {
      agent: "popAgent",
      inputs: [":query"],
    },
    reducer2: {
      agent: "pushAgent",
      inputs: [":result", ":reducer1.item"],
    },
  },
};

const graph_data2 = {
  version: 0.3,
  nodes: {
    query: {
      agent: "streamMockAgent",
      params: {
        isStreaming: true,
        message: "this is from the server",
      },
    },
    answer: {
      agent: "sleeperAgent",
      inputs: [":query"],
      isResult: true,
    },
  },
};

const graph_data3 = {
  version: 0.3,
  nodes: {
    node1: {
      value: "Please tell me about photosynthesis in 50 words.",
    },
    node2: {
      agent: "openAIAgent",
      params: {
        stream: true,
      },
      inputs: [":node1"],
      isResult: true,
    },
  },
};

const graph_data4 = {
  version: 0.3,
  nodes: {
    input: {
      value: "Steve Wozniak",
    },
    wikipedia: {
      inputs: [":input"],
      agent: "wikipediaAgent",
      isResult: true,
      params: {
        lang: "ja",
      },
    },
  },
};

export const graphDataSet = [
  {
    data: graph_data1,
    name: "slashgpt",
  },
  {
    data: graph_data2,
    name: "stream mock",
  },
  {
    data: graph_data3,
    name: "openai",
  },
  {
    data: graph_data4,
    name: "wikipedia",
  },
];
