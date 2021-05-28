<template>
  <div single-line class="tool-bar">
    <v-btn color="primary" text @click="createLine"> Создать линию </v-btn>
    <v-btn color="primary" text @click="addPoint">
      Добавить точку на линию
    </v-btn>
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
