<template>
  <div class="home">
    <div class="items-center justify-center">
      <div>
        <button class="text-white font-bold items-center rounded-full px-4 py-2 m-1 bg-sky-500 hover:bg-sky-700" @click="agentServer">AgentServer</button>
      </div>
      {{ messages.join("").split("___END___")[0] }}
      <div>
        Streaming<br />
        {{ graphData }}
      </div>
      <div>
        Result<br />
        {{ result }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { AgentFunctionContext } from "graphai/lib/type";

import { GraphAI } from "graphai";
// import { sleeperAgent, groqAgent } from "graphai/lib/experimental_agents";
import { sleeperAgent } from "graphai/lib/experimental_agents/sleeper_agents";
import * as agents from "graphai/lib/vanilla_agents";

import { streamAgentFilterBuilder, httpAgentFilter } from "./agentFilter";

const useAgentFilter = (callback: (context: AgentFunctionContext, data: T) => void) => {
  const streamAgentFilter = streamAgentFilterBuilder(callback);

  const agentFilters = [
    {
      name: "streamAgentFilter",
      agent: streamAgentFilter,
    },
    {
      name: "httpAgentFilter",
      agent: httpAgentFilter,
      filterParams: {
        server: {
          baseUrl: "http://localhost:8085/agents/",
          stream: true,
        },
      },
      agentIds: ["streamMockAgent", "slashGPTAgent"],
    },
  ];
  return agentFilters;
};

const graph_data = {
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
    },
    usage: {
      value: {},
      update: ":acountant",
    },
    retriever: {
      agent: "shiftAgent",
      inputs: [":people"],
    },
    query: {
      agent: "slashGPTAgent",
      params: {
        manifest: {
          prompt: "Describe about the person in less than 100 words",
        },
        isStreaming: true,
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
      isResult: true,
    },
    usageData: {
      agent: "totalAgent",
      inputs: [":reducer2.$0"],
    },
    acountant: {
      agent: "totalAgent",
      inputs: [":usage", ":usageData.usage"],
    },
  },
};
/*
const graph_data = {
  version: 0.3,
  nodes: {
    query: {
      inputs: [{}],
      agent: "streamMockAgent",
      params: {
        isStreaming: true,
        message: "this is from the server",
      },
      isResult: true,
    },
    answer: {
      agent: "sleeperAgent",
      inputs: ["query.choices.$0.message"],
    },
  },
};
*/

export default defineComponent({
  name: "HomePage",
  components: {},
  setup() {
    const graphData = ref<Record<string, any>>({});
    const result = ref<any>({});

    const callback = (context: AgentFunctionContext, data: string) => {
      const { nodeId } = context.debugInfo;
      graphData.value[nodeId] = (graphData.value[nodeId] ?? "") + data;
      console.log(data);
    };
    const agentFilters = useAgentFilter(callback);
    console.log(agents);
    const runGraph = async () => {
      const graphai = new GraphAI(
        graph_data,
        { ...agents, ...{ sleeperAgent, groqAgent: sleeperAgent, slashGPTAgent: sleeperAgent } },
        { agentFilters },
      );
      result.value = await graphai.run();
      console.log(result.value);
    };

    const messages = ref([]);
    /*
    const run = async (url: string) => {
      messages.value = [];
      const generator = streamChatCompletion(url, {
        params: {
          isStreaming: true,
          message: "this is from the server",
        }
      });
      for await (const token of generator) {
        if (token) {
          console.log(token);
          messages.value.push(token);
        }
      }
      try {
        const payload_data = messages.value.join("").split("___END___")[1];
        console.log(payload_data)
        const data = JSON.parse(payload_data);
        console.log(data);
      } catch (e) {
        console.log(e);
      }
      };
    */
    const agentServer = async () => {
      // const url = "http://localhost:8085/agents/streamMockAgent";
      // run(url);
      runGraph();
    };
    return {
      messages,
      // run,
      // chat,
      // slash,
      agentServer,
      runGraph,

      graphData,
      result,
    };
  },
});
</script>
