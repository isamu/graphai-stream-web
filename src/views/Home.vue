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
import * as agents from "graphai/lib/vanilla_agents";
import { sleeperAgent } from "graphai/lib/experimental_agents/sleeper_agents";

import { graphDataSet } from "./graph_data";

import { streamAgentFilterBuilder, httpAgentFilter } from "./agentFilter";

const serverAgentIds = ["groqAgent", "slashGPTAgent", "groqStreamAgent", "openAIAgent", "fetchAgent", "wikipediaAgent"];
const streamAgents = ["groqAgent", "slashGPTAgent", "groqStreamAgent", "openAIAgent", "streamMockAgent"];

const useAgentFilter = (callback: (context: AgentFunctionContext, data: T) => void) => {
  const streamAgentFilter = streamAgentFilterBuilder(callback);

  const agentFilters = [
    {
      name: "streamAgentFilter",
      agent: streamAgentFilter,
      agentIds: streamAgents,
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
      agentIds: serverAgentIds,
    },
  ];
  return agentFilters;
};

// llm, service
const serverAgents = serverAgentIds.reduce((tmp, agentId) => {
  tmp[agentId] = () => {};
  return tmp;
}, {});

export default defineComponent({
  name: "HomePage",
  components: {},
  setup() {
    const graphData = ref<Record<string, unknown>>({});
    const result = ref<unknown>({});

    const callback = (context: AgentFunctionContext, data: string) => {
      const { nodeId } = context.debugInfo;
      graphData.value[nodeId] = (graphData.value[nodeId] ?? "") + data;
      // console.log(data);
    };
    const agentFilters = useAgentFilter(callback);
    // console.log(agents);

    const runGraph = async () => {
      const graphai = new GraphAI(graphDataSet[0], { ...agents, ...serverAgents, sleeperAgent }, { agentFilters });
      graphai.onLogCallback = (log) => {
        console.log(log);
      };
      // result.value = await graphai.run();
      result.value = await graphai.run();
    };

    const messages = ref([]);
    const agentServer = async () => {
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
