<template>
  <div class="home text-left mx-8 mt-8">
    <div v-for="([agentId, data], key) in list" :key="key" class="border-2 p-2 m-2">
      <h2 class="font-bold">{{ agentId }}</h2>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "HomePage",
  components: {},
  setup() {
    const list = ref([]);
    const getdata = async () => {
      const url = "http://localhost:8085/agents/list";
      const result = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const data = await result.json();
      list.value = Object.keys(data).map((key) => {
        return [key, data[key]];
      });
      // console.log(data);
    };
    getdata();

    return {
      list,
    };
  },
});
</script>
