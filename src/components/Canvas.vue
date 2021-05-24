<template>
  <div>
    <canvas id="canvasFill" width="800" height="800"
      >Not supported Canvas</canvas
    >
    <canvas id="canvasAnim" width="800" height="800"
      >Not supported Canvas</canvas
    >
    <canvas
      id="canvas"
      width="800"
      height="800"
      @click="handleClick"
      @contextmenu="endDraw"
      @mousemove="mousemove"
      @mousedown="mousedownPoint"
      @mouseup="mouseupPoint"
      >Not supported Canvas</canvas
    >
    <form id="context-menu" :class="{ isVisible: visibleContextMenu }">
      <div>
        <label>Введите число парковочных мест: </label>
        <input type="text" />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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
      drawDelta: false,
      visibleContextMenu: false,
      movePoint: {
        index: -1,
        indexLine: -1,
        state: false,
      },
    };
  },
  methods: {
    // createClicker(clickFn: void, dblClickFn: void) {
    //   const doubleClickThreshold = 250;
    //   let timer;

    //   return function (event: MouseEvent) {
    //     const context = this as any;

    //     if (timer) {
    //       clearTimeout(timer);
    //       dblClickFn.call(context, event);
    //       timer = null;
    //       return;
    //     }

    //     timer = setTimeout(
    //       function (ctx) {
    //         timer = null;
    //         clickFn.call(ctx, event);
    //       },
    //       doubleClickThreshold,
    //       context
    //     );
    //   };
    // },
    startDraw(event: MouseEvent) {
      this.indexStartPoint = 0;
      this.drawDelta = false;

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
              joinedDelta: false,
            },
          ],
          delta: {
            x: 0,
            y: 0,
            len: {
              x: 50,
              y: 50,
            },
          },
          attributes: {
            parking_size: 0,
            disabled: false,
          },
        },
      };

      lines.push(line);
      this.$store.dispatch("savePoint", lines);
      this.$store.dispatch("startDraw");
    },
    handleClick(event: MouseEvent) {
      event.stopImmediatePropagation();
      this.visibleContextMenu = false;

      let x = event.offsetX;
      let y = event.offsetY;


      // Добавление точки на линию
      if (this.$store.state.addPoint) {
        const { indexLine, indexPoint } = this.lineover(x, y);
        const points = this.lines[indexLine].main_line.points;
        const point = {
          id: points.length,
          x,
          y,
          joinedDelta: false,
        };
        points.splice(indexPoint, 0, point);
        this.lines[indexLine].main_line.points = points;
        this.$store.dispatch("savePoint", this.lines);
        return "Add point";
      }

      // Выбор точки на линии
      if (
        this.$store.state.action != "movePoint" &&
        !this.$store.state.drawLine
      ) {
        let { indexPoint, indexLine } = this.pointover(x, y);
        if (indexPoint != -1) {
          let { lines } = this;
          lines[indexLine].main_line.points[indexPoint].joinedDelta = true;
          lines[indexLine].main_line.delta.x = x - 50;
          lines[indexLine].main_line.delta.y = y - 50;
          this.indexStartPoint = indexPoint;
          this.indexStartLine = indexLine;
          this.$store.dispatch("startDraw");
          this.drawDelta = true;
          return "Selected";
        }
      }

      // Начало отрисовки основной линии
      if (this.indexStartLine === this.lines.length && this.$store.state.action != "movePoint") {
        this.startDraw(event);
        return "Start drawing";
      }

      if (this.$store.state.drawLine) {
        // Добавление точек
        const { lines } = this;
        const countLines = lines.length;

        if (!this.drawDelta) {
          const points = this.lines[countLines - 1].main_line.points;
          const point = {
            id: points.length,
            x,
            y,
            joinedDelta: false,
          };
          points.push(point);
          this.indexStartPoint++;
          this.lines[countLines - 1].main_line.points = points;
        } else {
          const pointStart =
            lines[this.indexStartLine].main_line.points[this.indexStartPoint];
          const delta = {
            x,
            y,
            len: {
              x: pointStart.x - x,
              y: pointStart.y - y,
            },
          };
          lines[this.indexStartLine].main_line.delta = delta;
        }

        this.$store.dispatch("savePoint", lines);
      }
    },
    delayHandleClick(event: MouseEvent) {
      setTimeout(() => this.handleClick(event), 140);
    },
    mousedownPoint(event: MouseEvent) {
      let x = event.offsetX;
      let y = event.offsetY;

      let { indexPoint, indexLine } = this.pointover(x, y);
      if (this.lines.length > 0 && indexPoint >= 0) {
        this.downPoint = true;
        this.movePoint.index = indexPoint;
        this.movePoint.indexLine = indexLine;
      }

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
        this.$store.dispatch("changeAction", "auto");
        this.movePoint.state = false;
        this.movePoint.index = -1;
      }, 50);
    },
    mousemove(event: MouseEvent) {
      const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      let x = event.offsetX;
      let y = event.offsetY;

      // Анимация отрисовки линии
      if (this.$store.state.drawLine) {
        let start =
          this.lines[this.indexStartLine].main_line.points[
            this.indexStartPoint
          ];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawLine(ctx, start.x, start.y, x, y);
      }

      // Если мы навелись мышкой на точку
      if (this.lines.length > 0 && this.pointover(x, y).indexPoint >= 0) {
        this.$store.dispatch("changeAction", "pointerPoint"); // То меняем стили курсора
      } else {
        this.$store.dispatch("changeAction", "auto");
      }

      if (this.$store.state.addPoint) {
        this.$store.dispatch("changeAction", "addPoint");
      }

      // Перетаскивание точки
      if (this.downPoint) {
        this.movePoint.state = true;
        this.$store.dispatch("changeAction", "movePoint");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        // Если это первая точка
        if (this.movePoint.index === 0) {
          let start =
            this.lines[this.movePoint.indexLine].main_line.points[
              this.movePoint.index + 1
            ];
          this.drawLine(ctx, start.x, start.y, x, y);
          // Если это последняя точка
        } else if (
          this.movePoint.index ===
          this.lines[this.movePoint.indexLine].main_line.points.length - 1
        ) {
          let start =
            this.lines[this.movePoint.indexLine].main_line.points[
              this.movePoint.index - 1
            ];
          this.drawLine(ctx, start.x, start.y, x, y);
        } else {
          let start =
            this.lines[this.movePoint.indexLine].main_line.points[
              this.movePoint.index - 1
            ];
          let end =
            this.lines[this.movePoint.indexLine].main_line.points[
              this.movePoint.index + 1
            ];
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(x, y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }

        // Сохранение изменения координат точки

        const { lines } = this;
        const currentLine = lines[this.movePoint.indexLine].main_line;
        let { points, delta, attributes } = currentLine;
        points[this.movePoint.index].x = x;
        points[this.movePoint.index].y = y;

        // Если это точка к которой привязана дельта, тогда перемещаем дельту
        let index = points.findIndex((element, index) => {
          if (element.joinedDelta) {
            return { index };
          }
        });
        if (
          index != -1 &&
          this.comparisonCordPoints(x, y, points[index].x, points[index].y)
        ) {
          delta = {
            x: x - delta.len.x,
            y: y - delta.len.y,
            len: delta.len,
          };
        }
        const line = {
          main_line: {
            points,
            delta,
            attributes,
          },
        };

        lines[this.movePoint.indexLine] = line;
        this.$store.dispatch("savePoint", lines);
      }

      // Перетаскивание дельты
      if (this.indexDeltaLine != -1) {
        this.$store.dispatch("changeAction", "movePoint");
        const { lines } = this;
        const line = lines[this.indexDeltaLine].main_line;
        const points = line.points;
        let index = points.findIndex((element, index) => {
          if (element.joinedDelta) {
            return { index };
          }
        });

        const pointJoined = points[index];
        const delta = {
          x,
          y,
          len: {
            x: pointJoined.x - x,
            y: pointJoined.y - y,
          },
        };
        line.delta = delta;
        this.$store.dispatch("savePoint", lines);
      }
    },
    comparisonCordPoints(x1: number, y1: number, x2: number, y2: number) {
      if (x1 > x2 - 15 && x1 < x2 + 15 && y1 > y2 - 15 && y1 < y2 + 15) {
        return true;
      }
      return false;
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
      event.preventDefault();
      event.stopImmediatePropagation();
      this.visibleContextMenu = true;
      const contextMenu = document.querySelector(
        "#context-menu"
      ) as HTMLElement;
      contextMenu.style.left = `${event.offsetX}px`;
      contextMenu.style.top = `${event.offsetY}px`;
      this.$store.dispatch("endDraw");
      this.indexStartLine++;

      const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    submitData() {
      this.visibleContextMenu = false;
    },
    draw() {
      this.lines = this.$store.state.lines;

      const canvas = document.querySelector("#canvasAnim") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      const canvasFill = document.querySelector(
        "#canvasFill"
      ) as HTMLCanvasElement;
      const ctxFill = canvasFill.getContext("2d") as CanvasRenderingContext2D;

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
          const start = points[0];
          ctx.strokeStyle = "black";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.fillRect(start.x - 5, start.y - 5, 10, 10);
          for (let i = 0; i < points.length; i++) {
            const end = points[i];
            ctx.fillStyle = "blue";
            ctx.fillRect(end.x - 5, end.y - 5, 10, 10);
            ctx.lineTo(end.x, end.y);
          }
          ctx.stroke();

          ctxFill.beginPath();
          ctxFill.moveTo(start.x, start.y);
          for (let i = 0; i < points.length; i++) {
            const end = points[i];
            ctxFill.fillStyle = "rgba(0, 200, 200, .5)";
            ctxFill.lineTo(
              end.x - line.main_line.delta.len.x,
              end.y - line.main_line.delta.len.y
            );
          }
          for (let i = points.length - 1; i >= 0; i--) {
            const end = points[i];
            ctxFill.lineTo(
              end.x + line.main_line.delta.len.x,
              end.y + line.main_line.delta.len.y
            );
          }
          ctxFill.fill();

          let index = points.findIndex((element, index) => {
            if (element.joinedDelta) {
              return { index };
            }
          });
          // Отрисовка дельты
          if (index != -1) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "chartreuse";
            // Рисование основной линии дельты
            this.drawLine(
              ctx,
              points[index].x,
              points[index].y,
              line.main_line.delta.x,
              line.main_line.delta.y
            );
            ctx.fillRect(
              line.main_line.delta.x - 5,
              line.main_line.delta.y - 5,
              10,
              10
            );
            // Отражение линии дельты
            const delta = {
              x: points[index].x + line.main_line.delta.len.x,
              y: points[index].y + line.main_line.delta.len.y,
            };
            this.drawLine(
              ctx,
              points[index].x,
              points[index].y,
              delta.x,
              delta.y
            );
          }
        }
      }

      requestAnimationFrame(this.draw);
    },
    drawLine(
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
    this.draw();
    addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        this.$store.dispatch("addPoint");
      }
    });
    addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === "Control") {
        this.$store.dispatch("addPoint");
      }
      if (event.key === "Escape") {
        this.indexStartLine++;
        this.$store.dispatch("endDraw");

        const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.submitData();
      }
      if (event.key === "Delete") {
        if (this.lines.length > 0) {
          this.lines[this.indexStartLine].main_line.points.splice(this.indexStartPoint, 1);
          this.indexStartPoint = this.lines[this.indexStartLine].main_line.points.length - 1;
          if (this.indexStartPoint === -1) {
            this.lines.splice(this.indexStartLine, 1);
            this.$store.dispatch("endDraw");
          }
        }
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
  display: none;
  padding: 1em 2em;
  background-color: #fff;
}

.isVisible {
  display: grid;
}
</style>
