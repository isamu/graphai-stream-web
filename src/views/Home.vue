<template>
  <div class="home">
    <div class="flex items-center justify-center">
      <div>
        <button class="text-white font-bold items-center rounded-full px-4 py-2 m-1 bg-sky-500 hover:bg-sky-700" @click="agentServer">AgentServer</button>
      </div>
      {{ messages.join("").split("___END___")[0] }}
    </div>
  </div>
</template>

<script lang="ts">


import { defineComponent, ref } from "vue";
import { GraphAI } from "graphai";
// import { sleeperAgent, groqAgent } from "graphai/lib/experimental_agents";
import { sleeperAgent } from "graphai/lib/experimental_agents/sleeper_agents";
import * as agents from "graphai/lib/vanilla_agents";
//import { sleeperAgent } from "graphai/lib/vanilla_agents";

import { AgentFilterFunction } from "@/type";

import { streamChatCompletion } from "./utils";


// const callback = 
const streamAgentFilter: AgentFilterFunction = async (context, next) => {
  context.filterParams.streamTokenCallback = (data: string) => {
    console.log(data);
    // callback(context, data);
  };
  return next(context);
};

const httpAgentFilter: AgentFilterFunction = async (context) => {
  if (context?.filterParams?.server) {
    const { baseUrl } = context.filterParams.server;
    const agentId = context.debugInfo.agentId;
    const url = baseUrl + agentId;

    const generator = streamChatCompletion(url, {
      params: {
        isStreaming: true,
        message: "this is from the server",
      }
    });
    const messages = [];
    for await (const token of generator) {
      // callback to stream filter
      if (token) {
        messages.push(token);
        if (messages.join("").indexOf("___END___") === -1) {
          if (context.filterParams.streamTokenCallback) {
            context.filterParams.streamTokenCallback(token);
          }
        }
      }
    }

    const payload_data = messages.join("").split("___END___")[1];
    const data = JSON.parse(payload_data);
    return data;
  }
  return next(context);
};



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
    agentIds: ["streamMockAgent"]
  },
];

export default defineComponent({
  name: "HomePage",
  components: {},
  setup() {
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
        { ...agents, ...{sleeperAgent, groqAgent: sleeperAgent} },
        { agentFilters }
      );
      const r = await graphai.run();
      console.log(r)
    };

    const messages = ref([]);
    const run = async (url: string) => {
      runGraph();
      /*
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
      */
    };
    const agentServer = async () => {
      const url = "http://localhost:8085/agents/streamMockAgent";
      run(url);
    };
    return {
      messages,
      // run,
      // chat,
      // slash,
      agentServer,
      runGraph,
    };
  },
});
</script>
