<template>
  <CreateLine />
  <GetImg />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreateLine from "./components/CreateLine.vue";
import GetImg from "./components/GetImg.vue";

export default defineComponent({
  name: "App",

  components: {
    GetImg,
    CreateLine,
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
  grid-template-rows: 10% 90%;
  height: 100vh;
}

input {
  border: 1px solid #000;
  padding: 0.25em;
}
</style>
