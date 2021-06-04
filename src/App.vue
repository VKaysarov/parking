<template>
  <v-app>
    <ToolBar />
    <GetImg />
  </v-app>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

export default defineComponent({
  name: "App",

  components: {
    ToolBar: defineAsyncComponent(() => import("./components/ToolBar.vue")),
    GetImg: defineAsyncComponent(() => import("./components/GetImg.vue")),
  },

  data() {
    return {
      //
    };
  },
});
</script>

<style>
html {
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: grid;
  height: 100vh;
}

input {
  border: 1px solid #000;
  padding: 0.25em;
}

.v-app-bar {
  position: static;
}

.v-layout {
  overflow: hidden;
}
</style>
