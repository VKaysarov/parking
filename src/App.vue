<template>
  <CreateLine />
  <getImg />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import GetImg from "./components/GetImg.vue";
import CreateLine from "./components/CreateLine.vue";

@Options({
  components: {
    CreateLine,
    GetImg,
  },
})
export default class App extends Vue {}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

body {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  user-drag: none;
  -webkit-touch-callout: none;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: grid;
  grid-template-rows: 10% 90%;
  height: 100vh;
}

button {
  padding: 0.8em 1.4em;
}

img {
  user-select: none;
}
</style>
