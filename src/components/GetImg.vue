<template>
  <div id="canvas-wrapper" :class="changeStyleCursor">
    <Canvas />
    <!-- <img :src="imgUrl" alt="parking" class="parking-place" /> -->
    <img
      :src="`http://gpu3-chel1:8083/photo/${this.$store.state.imgId}`"
      width="1920"
      height="1080"
    />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
export default defineComponent({
  components: {
    Canvas: defineAsyncComponent(() => import("./Canvas.vue")),
  },
  name: "GetImg",
  data() {
    return {
      imgUrl: "",
    };
  },
  async mounted() {
    let response = await fetch(`/photo/${this.$store.state.imgId}`);
    let blob = response.blob();
    this.imgUrl = URL.createObjectURL(await blob);
  },
  computed: {
    changeStyleCursor: function () {
      return {
        addPoint: this.$store.state.action === "addPoint",
        movePoint: this.$store.state.action === "movePoint",
        moveDelta: this.$store.state.action === "moveDelta",
        pointerPoint: this.$store.state.action === "pointerPoint",
      };
    },
  },
});
</script>

<style>
img {
  user-select: none;
  margin: 0 auto;
  object-fit: cover;
}

#canvas-wrapper {
  position: relative;
  display: flex;
  max-height: calc(100% - 64px);
  height: 100%;
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

.movePoint,
.moveDelta {
  cursor: grabbing;
}

.pointerPoint {
  cursor: pointer;
}
</style>
