<template>
  <div id="canvas-wrapper" :class="classObject">
    <Canvas />
    <img :src="imgUrl" alt="parking" class="parking-place" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Canvas from "./Canvas.vue";
export default defineComponent({
  components: {
    Canvas,
  },
  name: "GetImg",
  data() {
    return {
      imgUrl: "",
    };
  },
  async mounted() {
    let response = await fetch("/photo/122");
    let blob = response.blob();
    this.imgUrl = URL.createObjectURL(await blob);
  },
  computed: {
    classObject: function () {
      return {
        addPoint: this.$store.state.action == "addPoint",
        movePoint: this.$store.state.action == "movePoint",
        pointerPoint: this.$store.state.action == "pointerPoint",
      };
    },
  },
});
</script>

<style>
#canvas-wrapper {
  position: relative;
}

#canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}

.parking-place {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.addPoint {
  cursor: cell;
}

.movePoint {
  cursor: grabbing;
}

.pointerPoint {
  cursor: pointer;
}
</style>
