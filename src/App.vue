<template>
  <v-app>
    <ToolBar />
    <GetImg />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ToolBar from "./components/ToolBar.vue";
import GetImg from "./components/GetImg.vue";

export default defineComponent({
  name: "App",

  components: {
    GetImg,
    ToolBar,
  },

  data() {
    return {
      //
    };
  },
});
</script>

<style>
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
