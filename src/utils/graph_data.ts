const graph_data1 = {
  version: 0.5,
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
      inputs: { array: ":people" },
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
      inputs: { array: ":query" },
    },
    reducer2: {
      agent: "pushAgent",
      inputs: { array: ":result", item: ":reducer1.item" },
    },
  },
};

const graph_data2 = {
  version: 0.5,
  nodes: {
    query: {
      agent: "streamMockAgent",
      params: {
        isStreaming: true,
        message: "this is from the server",
      },
      isResult: true,
    },
    answer: {
      agent: "sleeperAgent",
      inputs: { message: ":query.message" },
      isResult: true,
    },
  },
};

const graph_data3 = {
  version: 0.5,
  nodes: {
    node1: {
      value: "Please tell me about photosynthesis in 50 words.",
    },
    node2: {
      agent: "openAIAgent",
      params: {
        stream: true,
      },
      inputs: { prompt: ":node1" },
      isResult: true,
    },
  },
};

const graph_data4 = {
  version: 0.5,
  nodes: {
    input: {
      value: "Steve Wozniak",
    },
    wikipedia: {
      inputs: { query: ":input" },
      agent: "wikipediaAgent",
      isResult: true,
      params: {
        lang: "ja",
      },
    },
  },
};

const graph_callcenter = {
  version: 0.5,
  nodes: {
    customerPhoneAudioLog: {
      agent: "streamMockAgent",
      params: {
        message: "hi, tell me hoge hoge",
      },
      isResult: true,
    },
    audio2text: {
      agent: "streamMockAgent",
      inputs: {
        message: ":customerPhoneAudioLog.message",
      },
      isResult: true,
    },
    sentiment: {
      agent: "streamMockAgent",
      params: {
        message: "angry",
      },
      inputs: {
        wait: ":customerPhoneAudioLog",
      },
      isResult: true,
    },
    talkAnalysis: {
      inputs: {
        wait: ":audio2text",
      },
      agent: "streamMockAgent",
      params: {
        message: "this is message",
      },
      isResult: true,
    },
    functionCalling: {
      inputs: {
        message: ":talkAnalysis.message",
      },
      agent: "streamMockAgent",
      isResult: true,
    },
    onpremiseApi: {
      inputs: {
        message: ":functionCalling.message",
        wait: ":RAG",
      },
      agent: "streamMockAgent",
      isResult: true,
    },
    RAG: {
      inputs: {
        wait: [":sentiment", ":talkAnalysis"],
      },
      agent: "streamMockAgent",
      params: {
        message: "foo",
      },
      isResult: true,
    },
    data2speech: {
      inputs: {
        array: [":RAG", ":talkAnalysis", ":onpremiseApi"],
      },
      agent: "streamMockAgent",
      isResult: true,
    },
    responseToCustomer: {
      agent: "streamMockAgent",
      inputs: {
        wait: [":data2speech"],
      },
      params: {
        message: "response",
      },
      isResult: true,
    },
    storeToDatabase: {
      inputs: {
        waits: [":sentiment", ":talkAnalysis", ":onpremiseApi"],
      },
      agent: "streamMockAgent",
      params: {
        message: "response",
      },
      isResult: true,
    },
  },
};

export const graphDataSet = [
  {
    data: graph_callcenter,
    name: "callcenter",
  },
  /*
  {
    data: graph_data1,
    name: "slashgpt",
    },
  */
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
