<template>
  <div>
    <canvas id="canvasFill" ref="canvasFill" width="800" height="800"
      >Not supported Canvas</canvas
    >
    <canvas id="canvasAnim" ref="canvasAnim" width="800" height="800"
      >Not supported Canvas</canvas
    >
    <canvas
      id="canvas"
      ref="canvas"
      width="800"
      height="800"
      @click="handleClick"
      @contextmenu.prevent="endDraw"
      @mousemove="mousemove"
      @mousedown="mousedownPoint"
      @mouseup="mouseupPoint"
      >Not supported Canvas</canvas
    >
    <form
      ref="contextMenu"
      class="data-line"
      v-if="lines.length > 0"
      v-show="visibleContextMenu"
    >
      <input
        type="text"
        class="parking-count--small"
        v-model="lines[indexSelectedLine].main_line.attributes.parking_size"
      />
      <v-btn
        @click="
          lines[indexSelectedLine].main_line.attributes.disabled =
            !lines[indexSelectedLine].main_line.attributes.disabled
        "
        :color="
          lines[indexSelectedLine].main_line.attributes.disabled
            ? 'cyan'
            : 'disabled'
        "
        icon
        tile
        ><img src="/img/icon-disabled.svg" width="20" alt="icon-invalid"
      /></v-btn>
      <!-- <div class="input-wrapper">
        <label>Число парковочных мест: </label>
        <input type="text" placeholder="0" v-model="parking_size" />
      </div> -->
      <!-- <div class="input-wrapper">
        <label>Тип парковочных мест:</label>
        <div>
          <v-btn
            @click="invalid = true"
            elevation="2"
            tile
            fab
          >Инвалидные</v-btn>
          <v-btn
            @click="invalid = false"
            elevation="2"
            fab
            tile
          >Не инвалидные</v-btn>
        </div>
      </div> -->
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { animationDrawingLine, dragPoint, dragDelta } from "./CanvasMousemove";
import {
  addPointOnLine,
  selectPointOnLine,
  drawLine,
} from "./CanvasHandleClick";
import { renderMainLine, renderAreaLine, renderDelta } from "./CanvasRender";

export default defineComponent({
  name: "Canvas",
  data() {
    return {
      lines: [] as parkingPlacesArrayType,
      indexSelectedLine: 0,
      indexStartPoint: 0,
      indexDeltaLine: -1,
      moveLine: false,
      downPoint: false,
      visibleContextMenu: false,
      movePoint: {
        index: -1,
        indexLine: -1,
        state: false,
      },
    };
  },
  methods: {
    startDraw(event: MouseEvent) {
      const { lines } = this;
      const id = 0;
      const x = event.offsetX;
      const y = event.offsetY;
      const line = {
        main_line: {
          points: [
            {
              id,
              x,
              y,
              joinedDelta: true,
            },
          ],
          delta: {
            x: x - 50,
            y: y - 50,
            len: {
              x: 50,
              y: 50,
            },
          },
          attributes: {
            parking_size: 0,
            disabled: false,
            selected: true,
            path: {} as Path2D,
          },
        },
      };
      lines.push(line);
      this.indexStartPoint = 0;
      this.$store.dispatch("startDraw");
      this.$store.dispatch("savePoint", lines);
    },
    handleClick(event: MouseEvent) {
      const x = event.offsetX;
      const y = event.offsetY;

      const canvasFill = this.$refs.canvasFill as HTMLCanvasElement;
      const ctxFill = canvasFill.getContext("2d") as CanvasRenderingContext2D;

      // Добавление точки на линии
      if (this.$store.state.action === "addPoint") {
        addPointOnLine(this, x, y);
      }

      if (
        this.lines.length > 0 &&
        !this.$store.state.drawLine &&
        this.$store.state.action != "movePoint"
      ) {
        // Выбор точки на линии
        if (selectPointOnLine(this, x, y)) {
          return "Selected";
        }
        // Сброс выделения разметки линии
        for (let line of this.lines) {
          line.main_line.attributes.selected = false;
        }
      }

      // Выбор линии разметки
      for (let [index, line] of this.lines.entries()) {
        const attributes = line.main_line.attributes;
        const points = line.main_line.points;
        this.indexSelectedLine = index;
        if (ctxFill.isPointInPath(attributes.path, x, y)) {
          attributes.selected = true;
          return "Selected Line";
        }
      }

      // Начало рисования основной линии
      if (
        !this.$store.state.drawLine &&
        this.$store.state.action != "movePoint" &&
        !this.visibleContextMenu
      ) {
        this.indexSelectedLine = this.lines.length;
        this.startDraw(event);
        return "Start drawing";
      }
      this.visibleContextMenu = false;

      // Продолжение рисования основной линий
      if (this.$store.state.drawLine) {
        drawLine(this, x, y);
      }
    },
    mousedownPoint(event: MouseEvent) {
      const x = event.offsetX;
      const y = event.offsetY;

      // Нажатие на точку
      let { indexPoint, indexLine } = this.pointover(x, y);
      if (this.lines.length > 0 && indexPoint >= 0) {
        this.downPoint = true;
        this.movePoint.index = indexPoint;
        this.movePoint.indexLine = indexLine;
      }

      // Нажатие на дельту
      for (let [index, line] of this.lines.entries()) {
        if (
          this.comparisonCordPoints(
            x,
            y,
            line.main_line.delta.x,
            line.main_line.delta.y
          )
        ) {
          this.indexDeltaLine = index;
        }
      }
    },
    mouseupPoint() {
      this.downPoint = false;
      this.indexDeltaLine = -1;

      setTimeout(() => {
        this.$store.dispatch("changeAction", "waitAction");
        this.movePoint.state = false;
        this.movePoint.index = -1;
      }, 50);
    },
    mousemove(event: MouseEvent) {
      const x = event.offsetX;
      const y = event.offsetY;

      // Анимация отрисовки линии
      if (this.$store.state.drawLine) {
        animationDrawingLine(this, x, y);
      }

      // Сброс стилей мыши
      if (
        this.$store.state.action === "waitAction" ||
        this.$store.state.action === "pointerPoint"
      ) {
        this.$store.dispatch("changeAction", "auto");
      }

      // Если мы навелись мышкой на точку
      if (this.lines.length > 0 && this.pointover(x, y).indexPoint >= 0) {
        this.$store.dispatch("changeAction", "pointerPoint"); // То меняем стили курсора
      }

      // Если мы навелись мышкой на точку дельты
      for (let line of this.lines) {
        const delta = line.main_line.delta;
        if (this.comparisonCordPoints(x, y, delta.x, delta.y)) {
          this.$store.dispatch("changeAction", "pointerPoint");
        }
      }

      // Перетаскивание точки
      if (this.downPoint && !this.$store.state.drawLine) {
        dragPoint(this, x, y);
      }

      // Перетаскивание дельты
      if (this.indexDeltaLine != -1) {
        dragDelta(this, x, y);
      }
    },
    comparisonCordPoints(x1: number, y1: number, x2: number, y2: number) {
      return !!(x1 > x2 - 15 && x1 < x2 + 15 && y1 > y2 - 15 && y1 < y2 + 15);
    },
    pointover(mouseX: number, mouseY: number) {
      for (let [indexLine, line] of this.lines.entries()) {
        for (let [indexPoint, point] of line.main_line.points.entries()) {
          // Сравнение координат мыши и точки
          if (this.comparisonCordPoints(mouseX, mouseY, point.x, point.y)) {
            return { indexPoint, indexLine };
          }
        }
      }
      return { indexPoint: -1, indexLine: -1 };
    },
    // Сравнение координат мыши и линии
    lineover(mouseX: number, mouseY: number) {
      for (let [indexLine, line] of this.lines.entries()) {
        let points = line.main_line.points;
        for (let i = 0; i < points.length; i++) {
          let startPoint = { id: 0, x: 0, y: 0 };
          let endPoint = { id: 0, x: 0, y: 0 };
          if (i === points.length - 1) {
            startPoint = points[i - 1];
            endPoint = points[i];
          } else {
            startPoint = points[i];
            endPoint = points[i + 1];
          }
          if (
            // Если линия направлена в правый нижний угол
            (mouseX > startPoint.x &&
              mouseX < endPoint.x &&
              mouseY > startPoint.y &&
              mouseY < endPoint.y) ||
            // Если линия направлена в левый верхний угол
            (mouseX < startPoint.x &&
              mouseX > endPoint.x &&
              mouseY < startPoint.y &&
              mouseY > endPoint.y) ||
            // Если линия направлена в правый верхний угол
            (mouseX > startPoint.x &&
              mouseX < endPoint.x &&
              mouseY < startPoint.y &&
              mouseY > endPoint.y) ||
            // Если линия направлена в левый нижний угол
            (mouseX < startPoint.x &&
              mouseX > endPoint.x &&
              mouseY > startPoint.y &&
              mouseY < endPoint.y)
          ) {
            return { indexLine, indexPoint: i + 1 };
          }
        }
      }
      return { indexLine: -1, indexPoint: -1 };
    },
    endDraw(event: MouseEvent) {
      if (this.$store.state.drawLine) {
        // const contextMenu = this.$refs.contextMenu as HTMLElement;
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // contextMenu.style.left = `${event.offsetX}px`;
        // contextMenu.style.top = `${event.offsetY}px`;

        // this.visibleContextMenu = true;
        this.$store.dispatch("endDraw");
      }
    },
    submitData() {
      this.visibleContextMenu = false;
    },
    render() {
      const canvas = this.$refs.canvasAnim as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      const canvasFill = this.$refs.canvasFill as HTMLCanvasElement;
      const ctxFill = canvas.getContext("2d") as CanvasRenderingContext2D;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      canvasFill.width = canvasFill.offsetWidth;
      canvasFill.height = canvasFill.offsetHeight;

      this.lines = this.$store.state.lines;

      // Отрисовка всех точек и линий
      if (this.lines.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        for (let line of this.lines) {
          const mainLine = line.main_line;
          const points = mainLine.points;

          // Отрисовка области вокруг линии
          renderAreaLine(ctxFill, mainLine);

          if (mainLine.attributes.selected) {
            // Отрисовка основных линий и точек
            renderMainLine(ctx, points);
            // Отрисовка дельты
            renderDelta(this, ctx, mainLine);
            const contextMenu = this.$refs.contextMenu as HTMLElement;
            const contextX = mainLine.points[0].x - 50;
            const contextY = mainLine.points[0].y + 15;

            this.visibleContextMenu = true;
            contextMenu.style.left = `${contextX}px`;
            contextMenu.style.top = `${contextY}px`;
          }
        }
      }

      requestAnimationFrame(this.render);
    },
    renderLine(
      ctx: CanvasRenderingContext2D,
      startX: number,
      startY: number,
      endX: number,
      endY: number
    ) {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    },
  },
  mounted() {
    this.render();
    addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        this.$store.dispatch("changeAction", "addPoint");
      }
    });
    addEventListener("keyup", (event: KeyboardEvent) => {
      const { code } = event;
      if (code === "Control") {
        this.$store.dispatch("changeAction", "waitAction");
      }
      if (code === "Escape") {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.$store.dispatch("endDraw");
      }
      if (code === "Delete") {
        let currentLine = this.lines[this.indexSelectedLine].main_line;
        if (currentLine.points.length < 1) {
          return "Точек нет, нечего удалять";
        }
        currentLine.points.splice(this.indexStartPoint, 1);
        this.indexStartPoint = currentLine.points.length - 1;
        if (this.indexStartPoint === -1) {
          this.lines.splice(this.indexSelectedLine, 1);
          this.indexSelectedLine = this.lines.length - 1;
          this.$store.dispatch("endDraw");
        }
      }
    });
    addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.submitData();
      }
    });
  },
});
</script>

<style>
#canvas,
#canvasAnim,
#canvasFill {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
}

.data-line {
  position: absolute;
  /* padding: 1em 2em;
  background-color: #fff; */
}

.input-wrapper {
  display: grid;
  margin: 20px 0;
}

.parking-count--small {
  text-align: center;
  max-width: 40px;
  margin-right: 10px;
}
</style>
