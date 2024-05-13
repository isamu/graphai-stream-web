<template>
  <div class="home">
    <div class="items-center justify-center">
      <div>
        <select v-model="selectedGraphIndex" class="border rounded-md p-2 m-2">
          <option v-for="(option, index) in graphDataSet" :value="index" :key="index">
            {{ option.name }}
          </option>
        </select>
      </div>


      <div>
        <button class="text-white font-bold items-center rounded-full px-4 py-2 m-1 bg-sky-500 hover:bg-sky-700" @click="agentServer">AgentServer</button>
      </div>
      <div>
        Streaming<br />
        {{ streamingData }}
      </div>
      <div>
        Result<br />
        {{ result }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
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
    const selectedGraphIndex = ref(0);
    const selectedGraph = computed(() => {
      return graphDataSet[selectedGraphIndex.value].data;
    });

    const streamingData = ref<Record<string, unknown>>({});
    const result = ref<unknown>({});

    const callback = (context: AgentFunctionContext, data: string) => {
      const { nodeId } = context.debugInfo;
      streamingData.value[nodeId] = (streamingData.value[nodeId] ?? "") + data;
    };
    const agentFilters = useAgentFilter(callback);

    const runGraph = async () => {
      result.value = {};
      streamingData.value = {};

      const graphai = new GraphAI(selectedGraph.value, { ...agents, ...serverAgents, sleeperAgent }, { agentFilters });
      graphai.onLogCallback = (log) => {
        console.log(log);
      };
      result.value = await graphai.run();
    };

    const agentServer = async () => {
      runGraph();
    };
    return {
      agentServer,
      runGraph,

      streamingData,
      result,

      graphDataSet,
      selectedGraphIndex,
    };
  },
});
</script>
