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

const graph_callcenter = {
  version: 0.3,
  nodes: {
    customerPhoneAudioLog: {
      agent: "streamMockAgent",
      params: {
        message: "hi, tell me hoge hoge",
      },
    },
    audio2text: {
      agent: "streamMockAgent",
      params: {
        message: "hi, tell me hoge hoge",
      },
      inputs: [":customerPhoneAudioLog"],
    },
    sentiment: {
      agent: "streamMockAgent",
      params: {
        message: "angry",
      },
      inputs: [":customerPhoneAudioLog"],
    },
    talkAnalysis: {
      inputs: [":audio2text"],
      agent: "streamMockAgent",
      params: {
        message: "this is message",
      },
    },
    functionCalling: {
      inputs: [":talkAnalysis"],
      agent: "streamMockAgent",
    },
    onpremiseApi: {
      inputs: [":functionCalling", ":RAG"],
      agent: "streamMockAgent",
    },
    RAG: {
      inputs: [":sentiment", ":talkAnalysis"],
      agent: "streamMockAgent",
      params: {
        message: "foo",
      },
    },
    data2speech: {
      inputs: [":RAG", ":talkAnalysis", ":onpremiseApi"],
      agent: "streamMockAgent",

    },
    responseToCustomer: {
      agent: "streamMockAgent",
      inputs: [":data2speech"],
      params: {
        message: "response",
      },
      isResult: true,
    },
    storeToDatabase: {
      inputs: [":sentiment", ":talkAnalysis", ":onpremiseApi"],
      agent: "streamMockAgent",
      params: {
        message: "response",
      },
    },
  },
};

export const graphDataSet = [
  {
    data: graph_callcenter,
    name: "callcenter",
  },
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
