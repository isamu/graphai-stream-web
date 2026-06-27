<template>
  <div id="nav">
    <router-link :to="localizedUrl('/')">Home</router-link> |
    <router-link :to="localizedUrl('/about')">About</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
