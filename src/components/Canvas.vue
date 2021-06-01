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
      @mousedown="handleMousedown"
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
        ref="parkingSize"
        class="parking-count--small"
        v-model="lines[indexSelectedLine].main_line.attributes.parking_size"
        @input="validationParkingPlace"
        @focus="$event.target.select()"
      />
      <v-btn
        @click="
          lines[indexSelectedLine].main_line.attributes.disabled =
            !lines[indexSelectedLine].main_line.attributes.disabled
        "
        :color="
          lines[indexSelectedLine].main_line.attributes.disabled
            ? defaultParkingColor
            : invalidParkingColor
        "
        icon
        tile
        ><img src="/img/icon-disabled.svg" width="20" alt="icon-invalid"
      /></v-btn>
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
      defaultParkingColor: "#00fcff",
      invalidParkingColor: "#6200ee",
      indexSelectedLine: 0,
      indexStartPoint: 0,
      indexDeltaLine: -1,
      moveLine: false,
      visibleContextMenu: false,
      movePoint: {
        index: -1,
        indexLine: -1,
        state: false,
      },
    };
  },
  methods: {
    // События мыши
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
      this.$store.dispatch("savePoint", lines);
      this.$store.dispatch("changeAction", "drawLine");
    },
    handleClick(event: MouseEvent) {
      const x = event.offsetX;
      const y = event.offsetY;

      const canvasFill = this.$refs.canvasFill as HTMLCanvasElement;
      const ctxFill = canvasFill.getContext("2d") as CanvasRenderingContext2D;

      // Добавление точки на линии
      if (this.$store.state.action === "addPoint") {
        addPointOnLine(this, x, y);
        return;
      }

      // Выбор точки на линии
      if (this.$store.state.action === "downPoint") {
        selectPointOnLine(this, x, y);
        return;
      }
      
      // Выбор линии разметки
      if (this.$store.state.action !== "selectedLine") {

        for (let [index, line] of this.lines.entries()) {
          const attributes = line.main_line.attributes;
  
          if (ctxFill.isPointInPath(attributes.path, x, y)) {
            
            this.$store.dispatch("changeAction", "selectedLine");
            this.indexSelectedLine = index;
            attributes.selected = true;
  
            return;
          }
        }
      }

      // Сброс выделения разметки линии
      if (this.$store.state.action === "selectedLine") {
        
        for (let line of this.lines) {
          line.main_line.attributes.selected = false;
        }

        this.visibleContextMenu = false;
        this.$store.dispatch("changeAction", "waitAction");

        return;
      }

      // Начало рисования основной линии
      if (this.$store.state.action === "waitAction") {
        this.indexSelectedLine = this.lines.length;
        this.startDraw(event);
        return;
      }
      this.visibleContextMenu = false;

      // Продолжение рисования основной линий
      if (this.$store.state.action === "drawLine") {
        drawLine(this, x, y);
      }
    },
    handleMousedown(event: MouseEvent) {
      const x = event.offsetX;
      const y = event.offsetY;

      // Нажатие на точку
      let { indexPoint, indexLine } = this.pointover(x, y);
      if (this.lines.length > 0 && indexPoint >= 0) {
        this.$store.dispatch("changeAction", "downPoint");
        this.movePoint.index = indexPoint;
        this.movePoint.indexLine = indexLine;
      }

      // Нажатие на дельту
      for (let [index, line] of this.lines.entries()) {
        const delta = line.main_line.delta;
        const reverseDelta = {
          x: delta.x + 2 * delta.len.x,
          y: delta.y + 2 * delta.len.y,
        };

        if (
          this.comparisonCordPoints(x, y, delta.x, delta.y) ||
          this.comparisonCordPoints(x, y, reverseDelta.x, reverseDelta.y)
        ) {
          this.indexDeltaLine = index;
        }
      }
    },
    mouseupPoint() {
      const canvas = this.$refs.canvas as HTMLCanvasElement;
      this.indexDeltaLine = -1;

      setTimeout(() => {
        canvas.style.zIndex = "0";
        if (
          this.$store.state.action === "movePoint" ||
          this.$store.state.action === "moveDelta"
        ) {
          this.$store.dispatch("changeAction", "waitAction");
        }
        this.movePoint.state = false;
        this.movePoint.index = -1;
      }, 50);
    },
    mousemove(event: MouseEvent) {
      const canvas = this.$refs.canvas as HTMLCanvasElement;
      const x = event.offsetX;
      const y = event.offsetY;

      // Анимация отрисовки линии
      if (this.$store.state.action === "drawLine") {
        animationDrawingLine(this, x, y);
      }

      // Сброс стилей мыши
      if (this.$store.state.action === "pointerPoint") {
        this.$store.dispatch("changeAction", "selectedLine");
      }

      // Если мы навелись мышкой на точку
      if (
        this.lines.length > 0 &&
        this.pointover(x, y).indexPoint >= 0 &&
        this.$store.state.action === "selectedLine"
      ) {
        this.$store.dispatch("changeAction", "pointerPoint"); // То меняем стили курсора
      }

      // Если мы навелись мышкой на точку дельты
      for (let line of this.lines) {
        const delta = line.main_line.delta;
        const reverseDelta = {
          x: delta.x + 2 * delta.len.x,
          y: delta.y + 2 * delta.len.y,
        };

        if (
          (this.comparisonCordPoints(x, y, delta.x, delta.y) ||
            this.comparisonCordPoints(x, y, reverseDelta.x, reverseDelta.y)) &&
          this.$store.state.action === "waitAction"
        ) {
          this.$store.dispatch("changeAction", "pointerPoint");
        }
      }

      // Перетаскивание точки
      if (
        this.$store.state.action === "downPoint" ||
        this.$store.state.action === "movePoint"
      ) {
        canvas.style.zIndex = "1";
        dragPoint(this, x, y);
      }

      // Перетаскивание дельты
      if (this.indexDeltaLine !== -1) {
        canvas.style.zIndex = "1";
        dragDelta(this, x, y);
      }
    },
    endDraw() {
      if (this.$store.state.action === "drawLine") {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.$store.dispatch("changeAction", "selectedLine");
      }
    },

    // Сравнение координат двух точек
    comparisonCordPoints(x1: number, y1: number, x2: number, y2: number) {
      return !!(x1 > x2 - 15 && x1 < x2 + 15 && y1 > y2 - 15 && y1 < y2 + 15);
    },
    // Сравнение координат мыши и точки
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

    // Валидация поля 'количество парковочных мест'
    validationParkingPlace() {
      const mainLine = this.lines[this.indexSelectedLine].main_line;
      const parkingSizeString = String(mainLine.attributes.parking_size);
      const parkingSizeNumber = Number(parkingSizeString);

      if (isNaN(parkingSizeNumber) || parkingSizeNumber > 999) {
        const newParkingSize = parkingSizeString.slice(0, -1);
        this.lines[this.indexSelectedLine].main_line.attributes.parking_size =
          Number(newParkingSize);
      }
    },

    // Отрисовка разметки
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
          const contextMenu = this.$refs.contextMenu as HTMLElement;
          const contextX = mainLine.points[0].x - 50;
          const contextY = mainLine.points[0].y + 15;

          // Отрисовка области вокруг линии
          renderAreaLine(this, ctxFill, mainLine);

          if (mainLine.attributes.selected) {
            // Отрисовка основных линий и точек
            renderMainLine(ctx, points);
            // Отрисовка дельты
            renderDelta(this, ctx, mainLine);

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
      const { indexSelectedLine } = this;
      const canvas = this.$refs.canvas as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      if (event.key === "Control") {
        this.$store.dispatch("changeAction", "selectedLine");
      }

      if (code === "Escape") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.$store.dispatch("changeAction", "waitAction");
      }

      // удаление точек
      if (code === "Delete" && this.lines.length > 0) {
        const currentLine = this.lines[indexSelectedLine].main_line;

        currentLine.points.splice(this.indexStartPoint, 1);
        this.indexStartPoint = currentLine.points.length - 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (currentLine.points.length < 2) {
          this.visibleContextMenu = false;
          this.lines.splice(indexSelectedLine, 1);
          this.indexSelectedLine = this.lines.length - 1;
          this.$store.dispatch("changeAction", "waitAction");
        }
      }
    });
    addEventListener("keypress", (event: KeyboardEvent) => {
      const parkingSize = this.$refs.parkingSize as HTMLElement;

      if (event.key === "Enter") {
        event.preventDefault();
        parkingSize.blur();
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
  background-color: #fff;
}
</style>
