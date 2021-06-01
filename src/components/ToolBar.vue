<template>
  <v-app-bar color="primary">
    <v-app-bar-nav-icon
      @click="this.drawer = !this.drawer"
    ></v-app-bar-nav-icon>

    <v-app-bar-title>Title</v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-heart</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" absolute temporary>
    <v-app-bar-title>Lines: </v-app-bar-title>
    <ul>
      <li v-for="[index, line] in lines.entries()" :key="index">
        <v-card
          block
          tile
          color="primary"
          v-if="line.main_line.attributes.selected"
        >
          <span class="v-btn__left-item">
            {{ `Line ${index + 1} ` }}
          </span>
          {{ lineInfo(line.main_line) }}
        </v-card>
        <v-card block tile @click="selectLine(line.main_line, index)" v-else>
          <span class="v-btn__left-item">
            {{ `Line ${index + 1} ` }}
          </span>
          {{ lineInfo(line.main_line) }}
        </v-card>
      </li>
    </ul>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ToolBar",
  data() {
    return {
      lines: [] as parkingPlacesArrayType,
      drawer: false,
      group: null,
    };
  },
  methods: {
    selectLine(mainLine: IMainLine, index: number) {
      for (let line of this.lines) {
        line.main_line.attributes.selected = false;
      }
      mainLine.attributes.selected = true;
      this.$store.dispatch("selectLine", index);
      this.$store.dispatch("savePoint", this.lines);
      this.$store.dispatch("changeAction", "selectedLine");
    },
    lineInfo(mainLine: IMainLine) {
      if (mainLine.attributes.disabled) {
        return `инвалидных ${mainLine.attributes.parking_size}`;
      }
      return `неинвалидных ${mainLine.attributes.parking_size}`;
    },
  },
  mounted() {
    this.lines = this.$store.state.lines;
  },
});
</script>

<style>
.tool-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-btn--size-default {
  font-size: 0.8rem;
}

.v-btn__left-item {
  font-weight: bold;
  margin-right: 5px;
}

li > .v-card {
  padding: 0.4em 1.4em;
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
    0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
}
</style>
