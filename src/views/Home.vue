<template>
  <div class="home">
    <div>
      <div>
        <div class="w-10/12 h-96 bg-white rounded-md mt-4 mx-auto border-2">
          <div ref="cytoscopeRef" class="w-full h-full" />
        </div>
      </div>
      <div class="flex">
        <div class="w-1/8 items-center justify-center">
          <div>
            <select v-model="selectedGraphIndex" class="border rounded-md p-2 m-2">
              <option v-for="(option, index) in graphDataSet" :value="index" :key="index">
                {{ option.name }}
              </option>
            </select>
          </div>

          <div>
            <button class="text-white font-bold items-center rounded-full px-4 py-2 m-1 bg-sky-500 hover:bg-sky-700" @click="agentServer">Run</button>
          </div>
        </div>

        <div class="w-7/8 text-left">
          <div class="w-full break-words whitespace-pre-wrap">
            Streaming<br />
            {{ JSON.stringify(streamingData, null, 2) }}
          </div>
          <div>
            Result<br />
            {{ JSON.stringify(result, null, 2) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

import { GraphAI, AgentFunctionContext } from "graphai";

import * as agents from "@graphai/vanilla";
console.log(agents);
import { sleeperAgent } from "@graphai/sleeper_agents";
import { streamAgentFilterGenerator } from "@graphai/agent_filters";

import { graphDataSet } from "@/utils/graph_data";
import { httpAgentFilter } from "@/utils/agentFilter";

import { useCytoscope } from "@/composables/cytoscope";

const serverAgentIds = ["groqAgent", "slashGPTAgent", "openAIAgent", "fetchAgent", "wikipediaAgent"];
const streamAgents = ["groqAgent", "slashGPTAgent", "openAIAgent", "streamMockAgent"];

const useAgentFilter = (callback: (context: AgentFunctionContext, data: T) => void) => {
  const streamAgentFilter = streamAgentFilterGenerator(callback);

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
          baseUrl: "http://localhost:8085/agents",
          stream: true,
        },
      },
      agentIds: serverAgentIds,
    },
  ];
  return agentFilters;
};

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

    const { updateCytoscope, cytoscopeRef } = useCytoscope(selectedGraph);

    const runGraph = async () => {
      result.value = {};
      streamingData.value = {};
      console.log(selectedGraph.value);
      const graphai = new GraphAI(selectedGraph.value, { ...agents, sleeperAgent }, { agentFilters, bypassAgentIds: serverAgentIds });
      graphai.onLogCallback = (log) => {
        const isServer = serverAgentIds.includes(log.agentId);
        updateCytoscope(log.nodeId, log.state === "executing" && isServer ? "executing-server" : log.state);
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

      cytoscopeRef,
    };
  },
});
</script>
