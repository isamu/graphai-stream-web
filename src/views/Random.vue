<template>
  <div class="home">
    <div>
      <div>
        <div class="w-10/12 h-96 bg-white rounded-md mt-4 mx-auto border-2">
          <div ref="cytoscapeRef" class="w-full h-full" />
        </div>
      </div>
      <div class="mt-2">
        <div>Static Node: <input type="number" class="border-2 rounded-md p-2" v-model="staticNode" /></div>
        <div>Dynamic Node: <input type="number" class="border-2 rounded-md p-2" v-model="computedNode" /></div>
        <div>Concurrency: <input type="number" class="border-2 rounded-md p-2" v-model="concurrency" /></div>
        <button class="text-white font-bold items-center rounded-full px-4 py-2 m-1 bg-sky-500 hover:bg-sky-700" @click="update">Update</button>
      </div>

      <div class="flex">
        <div class="w-1/8 items-center justify-center">

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
import { defineComponent, ref } from "vue";

import { GraphAI, AgentFunctionContext } from "graphai";

import * as agents from "@graphai/vanilla";
import { sleeperAgent } from "@graphai/sleeper_agents";
import { streamAgentFilterGenerator } from "@graphai/agent_filters";

import { generateGraph } from "@/utils/graph";

import { httpAgentFilter } from "@/utils/agentFilter";

import { useCytoscape } from "@receptron/graphai_vue_cytoscape";

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
    const staticNode = ref(20);
    const computedNode = ref(30);
    const concurrency = ref(8);

    const selectedGraph = ref(generateGraph(staticNode.value, computedNode.value));

    const selectedGraphIndex = ref(0);

    const streamingData = ref<Record<string, unknown>>({});
    const result = ref<unknown>({});

    const callback = (context: AgentFunctionContext, data: string) => {
      const { nodeId } = context.debugInfo;
      streamingData.value[nodeId] = (streamingData.value[nodeId] ?? "") + data;
    };
    const agentFilters = useAgentFilter(callback);

    const { updateCytoscape, cytoscapeRef } = useCytoscape(selectedGraph);

    const runGraph = async () => {
      result.value = {};
      streamingData.value = {};
      const graphai = new GraphAI(selectedGraph.value, { ...agents, sleeperAgent }, { agentFilters, bypassAgentIds: serverAgentIds });
      graphai.onLogCallback = (log) => {
        const isServer = serverAgentIds.includes(log.agentId);
        updateCytoscape(log.nodeId, log.state === "executing" && isServer ? "executing-server" : log.state);
      };
      result.value = await graphai.run();
    };

    const agentServer = async () => {
      runGraph();
    };
    const update = () => {
      console.log("update");
      selectedGraph.value = generateGraph(staticNode.value, computedNode.value, concurrency.value);
    };
    return {
      agentServer,
      runGraph,

      streamingData,
      result,

      selectedGraphIndex,
      update,

      staticNode,
      computedNode,
      concurrency,
      
      cytoscapeRef,
    };
  },
});
</script>
