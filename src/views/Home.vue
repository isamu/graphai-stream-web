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
      agentIds: ["streamMockAgent"],
    },
  ];
  return agentFilters;
};

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
    const runGraph = async () => {
      const graphai = new GraphAI(
        {
          version: 0.3,
          nodes: {
            /*
            query: {
              inputs: [{}],
              agent: "groqAgent",
              params: {
                model: "mixtral-8x7b-32768",
                query: "hello",
              },
              isResult: true,
              },
            */
            query: {
              inputs: [{}],
              agent: "streamMockAgent",
              isResult: true,
            },
            answer: {
              agent: "sleeperAgent",
              inputs: ["query.choices.$0.message"],
            },
          },
        },
        { ...agents, ...{ sleeperAgent, groqAgent: sleeperAgent } },
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
