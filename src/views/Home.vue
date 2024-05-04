<template>
  <div class="home">
    <div class="flex items-center justify-center">
      <div>
        <button class="text-white font-bold items-center rounded-full px-4 py-2 m-1 bg-sky-500 hover:bg-sky-700" @click="chat">Chat</button>
        <button class="text-white font-bold items-center rounded-full px-4 py-2 m-1 bg-sky-500 hover:bg-sky-700" @click="slash">Slash</button>
      </div>
      {{ messages.join("") }}
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

// const layouts = ["grid", "cose", "random", "circle", "concentric", "fcose", "breadthfirst"];

export async function* streamChatCompletion(url: string) {
  // const url = "http://localhost:8085/api/stream_chat";
  // const url = "http://localhost:8085/api/stream_slash";

  const completion = await fetch(
    url,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }
  );

  const reader = completion.body?.getReader();

  if (completion.status !== 200 || !reader) {
    throw new Error("Request failed");
  }

  const decoder = new TextDecoder("utf-8");
  let done = false;
  while (!done) {
    const { done: readDone, value } = await reader.read();
    if (readDone) {
      done = readDone;
      reader.releaseLock();
    } else {
      const token = decoder.decode(value, { stream: true });
      yield token;
    }
  }
}

export default defineComponent({
  name: "HomePage",
  components: {},
  setup() {
    const messages = ref([]);
    const run = async (url: string) => {
      console.log(url);
      const generator = streamChatCompletion(url);
      for await (const token of generator) {
        if (token) {
          console.log(token);
          messages.value.push(token);
        }
      }
    }
    const chat = async () => {
      const url = "http://localhost:8085/api/stream_chat";
      run(url);
    }
    const slash = async () => {
      const url = "http://localhost:8085/api/stream_slash";
      run(url);
    };
    return {
      messages,
      // run,
      chat,
      slash,
    };
  },
});
</script>
