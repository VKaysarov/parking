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
    <form ref="contextMenu" v-show="visibleContextMenu">
      <div>
        <label>Введите число парковочных мест: </label>
        <input type="text" />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { animationDrawingLine, dragPoint, dragDelta } from "./CanvasMousemove";
import { addPointOnLine, selectPointOnLine, drawLine } from "./CanvasHandleClick";

export default defineComponent({
  name: "Canvas",
  data() {
    return {
      indexStartLine: 0,
      indexDeltaLine: -1,
      indexStartPoint: 0,
      lines: [] as parkingPlacesArrayType,
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
        if(selectPointOnLine(this, x, y)) {
          return "Selected";
        }
        // Сброс выделения разметки линии
        for (let line of this.lines) {
          this.indexStartLine = this.lines.length;
          line.main_line.attributes.selected = false;
        }
      }

      // Выбор линии разметки
      for (let line of this.lines) {
        const attributes = line.main_line.attributes;
        const points = line.main_line.points;
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
        this.startDraw(event);
        this.indexStartLine = this.lines.length - 1;
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
      const contextMenu = this.$refs.contextMenu as HTMLElement;
      const canvas = this.$refs.canvas as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      contextMenu.style.left = `${event.offsetX}px`;
      contextMenu.style.top = `${event.offsetY}px`;

      this.indexStartLine++;
      this.visibleContextMenu = true;
      this.$store.dispatch("endDraw");
    },
    submitData() {
      this.visibleContextMenu = false;
    },
    render() {
      const canvas = this.$refs.canvasAnim as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      const canvasFill = this.$refs.canvasFill as HTMLCanvasElement;
      const ctxFill = canvasFill.getContext("2d") as CanvasRenderingContext2D;

      this.lines = this.$store.state.lines;

      canvasFill.width = canvasFill.offsetWidth;
      canvasFill.height = canvasFill.offsetHeight;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Отрисовка всех точек и линий
      if (this.lines.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        for (let line of this.lines) {
          const points = line.main_line.points;

          if (line.main_line.attributes.selected) {
            // Отрисовка основных линий и точек
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.strokeStyle = "black";
            for (let i = 0; i < points.length; i++) {
              const end = points[i];
              const circle = new Path2D();
              ctx.fillStyle = "blue";
              circle.arc(end.x, end.y, 5, 0, 2 * Math.PI);
              ctx.fill(circle);
              ctx.lineTo(end.x, end.y);
            }
            ctx.stroke();
          }

          // Отрисовка области вокруг линии
          let path = new Path2D();
          line.main_line.attributes.path = path;
          for (let i = 0; i < points.length; i++) {
            const end = points[i];
            ctxFill.fillStyle = "rgba(0, 200, 200, .5)";
            path.lineTo(
              end.x - line.main_line.delta.len.x,
              end.y - line.main_line.delta.len.y
            );
          }
          for (let i = points.length - 1; i >= 0; i--) {
            const end = points[i];
            path.lineTo(
              end.x + line.main_line.delta.len.x,
              end.y + line.main_line.delta.len.y
            );
          }
          ctxFill.fill(path);

          if (line.main_line.attributes.selected) {
            // Отрисовка дельты
            let index = points.findIndex((element, index) => {
              if (element.joinedDelta) {
                return { index };
              }
            });

            if (index != -1) {
              ctx.lineWidth = 2;
              ctx.strokeStyle = "chartreuse";
              // Рисование основной линии дельты
              this.renderLine(
                ctx,
                points[index].x,
                points[index].y,
                line.main_line.delta.x,
                line.main_line.delta.y
              );
              // Рисование точки дельты
              let circle = new Path2D();
              circle.arc(
                line.main_line.delta.x,
                line.main_line.delta.y,
                5,
                0,
                2 * Math.PI
              );
              ctx.fill(circle);
              // Отрисовка линии дельты
              let delta = {
                x: points[index].x + line.main_line.delta.len.x,
                y: points[index].y + line.main_line.delta.len.y,
              };
              this.renderLine(
                ctx,
                points[index].x,
                points[index].y,
                delta.x,
                delta.y
              );
            }
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
      if (event.key === "Control") {
        this.$store.dispatch("changeAction", "waitAction");
      }
      if (event.key === "Escape") {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.indexStartLine++;
        this.$store.dispatch("endDraw");
      }
      if (event.key === "Delete") {
        let currentLine = this.lines[this.indexStartLine].main_line;
        if (currentLine.points.length < 1) {
          return "Точек нет, нечего удалять"; 
        }
        currentLine.points.splice(this.indexStartPoint, 1);
        this.indexStartPoint = currentLine.points.length - 1;
        if (this.indexStartPoint === -1) {
          this.lines.splice(this.indexStartLine, 1);
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

form {
  position: absolute;
  padding: 1em 2em;
  background-color: #fff;
}
</style>
