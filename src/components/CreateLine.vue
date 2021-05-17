<template>
  <div class="tool-bar">
    <button @click="createLine">Создать линию</button>
    <button @click="addPoint">Добавить точку на линию</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CreateLine",
  data() {
    return {};
  },
  methods: {
    createLine() {
      this.$store.dispatch("addPoint");
      this.$store.dispatch("changeAction", "addPoint");
      this.$store.dispatch("addPoint");
      this.$store.dispatch("changeAction", "auto");
    },
    addPoint() {
      this.$store.dispatch("addPoint");
    },
  },
});
</script>

<style>
.tool-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
