<template>
  <canvas id="canvasAnim" width="800" height="800">Not supported Canvas</canvas>
  <canvas id="canvasFill" width="800" height="800">Not supported Canvas</canvas>
  <canvas
    id="canvas"
    width="800"
    height="800"
    @click="handleClick"
    @dblclick="startDraw"
    @contextmenu="endDrawLine"
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
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Canvas",
  data() {
    const defaultPoints: parkingPlacesArrayType = []
    return {
      lineClosed: -1,
      indexMovePoint: -1,
      points: defaultPoints,
      moveLine: false,
      downPoint: false,
      visibleContextMenu: false,
    };
  },
  methods: {
    startDraw(event: MouseEvent) {
      const canvas = document.querySelector("#canvasAnim") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      let x = event.offsetX;
      let y = event.offsetY;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 4;

      const points = this.points;

      points.push({
        coordinates: {
          x,
          y,
          positionNumber: 0,
        },
        finished: false,
        meta: {
          placeNumber: 0,
          forDisabledDrive: false,
        },
      });

      this.$store.dispatch("savePoint", points);
      this.$store.dispatch("startDraw");
    },
    handleClick(event: MouseEvent) {
      this.visibleContextMenu = false;

      let x = event.offsetX;
      let y = event.offsetY;

      if (this.$store.state.addPoint) {
        const points = this.points;
        points.push({
          coordinates: {
            x,
            y,
            positionNumber: 0,
          },
          finished: false,
          meta: {
            placeNumber: 0,
            forDisabledDrive: false,
          },
        });
        this.$store.dispatch("savePoint", points);
      }

      if (this.$store.state.drawLine) {
        // Замыкание линий
        let indexFoundPoint = this.pointover(x, y);
        // Если мы кликнули на точку
        if (indexFoundPoint == 0) {
          this.endDrawLine(event);
          this.lineClosed = indexFoundPoint;
          for (let i = 0; i < this.points.length; i++) {
            this.points[i].finished = true;
          }

          return "Замкнулась";
        }

        // let lastPoint = this.points[this.points.length - 1].coordinates;
        // let penultPoint = this.points[this.points.length - 2] || {
        //   coordinates: { x: -2, y: -2 }
        // };

        // let indexFoundPoint = this.pointover(x, y);

        // // Если мы кликнули на точку
        // if (indexFoundPoint != -1) {
        //   let foundPoint = this.points[indexFoundPoint].coordinates;

        //   if (
        //     lastPoint.x != foundPoint.x &&
        //     lastPoint.y != foundPoint.y &&
        //     penultPoint.coordinates.x != foundPoint.x &&
        //     penultPoint.coordinates.y != foundPoint.y
        //   ) {
        //     this.endDrawLine(event);
        //     this.lineClosed = indexFoundPoint;
        //     for(let i = indexFoundPoint; i < this.points.length; i++) {
        //       this.points[i].finished = true;
        //     }
        //     return "Замкнулась";
        //   }
        // }

        // Добавление точек
        const points = this.points;
        points.push({
          coordinates: {
            x,
            y,
            positionNumber: 0,
          },
          finished: false,
          meta: {
            placeNumber: 0,
            forDisabledDrive: false,
          },
        });
        this.$store.dispatch("savePoint", points);
      }
    },
    mousedownPoint(event: MouseEvent) {
      let x = event.offsetX;
      let y = event.offsetY;

      if (this.pointover(x, y) >= 0) {
        this.downPoint = true;
        this.indexMovePoint = this.pointover(x, y);
      }

      // Перетаскивание линии
      for (let i = 0; i < this.points.length - 1; i++) {
        let pointLeft = this.points[i].coordinates;
        let pointRight = this.points[i + 1].coordinates;
        if (
          x > pointLeft.x &&
          x < pointRight.x &&
          y > pointLeft.y &&
          y < pointRight.y
        ) {
          this.moveLine = true;
        }
      }
    },
    mouseupPoint() {
      if (this.downPoint) {
        const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.$store.dispatch("changeAction", "auto");
        this.downPoint = false;
        this.indexMovePoint = -1;
      }
    },
    mousemove(event: MouseEvent) {
      const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      let x = event.offsetX;
      let y = event.offsetY;

      if (this.$store.state.drawLine) {
        let start = this.points[this.points.length - 1].coordinates;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawLine(ctx, start.x, start.y, x, y);
      }

      // Если мы навелись мышкой на точку
      if (this.pointover(x, y) >= 0) {
        this.$store.dispatch("changeAction", "pointerPoint"); // То меняем стили курсора
      } else {
        this.$store.dispatch("changeAction", "auto");
      }

      if (this.$store.state.addPoint) {
        this.$store.dispatch("changeAction", "addPoint");
      }

      // Перетаскивание точки
      if (this.downPoint) {
        this.$store.dispatch("changeAction", "movePoint");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        // Если это первая точка
        if (this.indexMovePoint == 0) {
          let start = this.points[this.indexMovePoint + 1].coordinates;
          this.drawLine(ctx, start.x, start.y, x, y);
          // Если это последняя точка
        } else if (this.indexMovePoint == this.points.length - 1) {
          let start = this.points[this.indexMovePoint - 1].coordinates;
          this.drawLine(ctx, start.x, start.y, x, y);
        } else {
          let start = this.points[this.indexMovePoint - 1].coordinates;
          let end = this.points[this.indexMovePoint + 1].coordinates;
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(x, y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }

        // Сохранение изменения положения точки
        const points = this.points;
        points[this.indexMovePoint].coordinates.x = x;
        points[this.indexMovePoint].coordinates.y = y;
        this.$store.dispatch("savePoint", points);
      }
    },
    pointover(mouseX: number, mouseY: number) {
      for (let [index, point] of this.points.entries()) {
        // Сравнение координат мыши и точки
        if (
          // По оси X
          mouseX > point.coordinates.x - 15 &&
          mouseX < point.coordinates.x + 15 &&
          // По оси Y
          mouseY > point.coordinates.y - 15 &&
          mouseY < point.coordinates.y + 15
        ) {
          return index;
        }
      }
      return -1;
    },
    endDrawLine(event: MouseEvent) {
      event.preventDefault();
      this.visibleContextMenu = true;
      const contextMenu = document.querySelector(
        "#context-menu"
      ) as HTMLElement;
      contextMenu.style.left = `${event.offsetX}px`;
      contextMenu.style.top = `${event.offsetY}px`;
      this.$store.dispatch("endDraw");
    },
    draw() {
      const canvas = document.querySelector("#canvasAnim") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      this.points = this.$store.state.points;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Отрисовка всех точек и линий
      for (let i = 1; i < this.points.length; i++) {
        const start = this.points[i - 1].coordinates;
        const end = this.points[i].coordinates;

        ctx.fillStyle = "green";
        ctx.fillRect(start.x - 5, start.y - 5, 10, 10);
        ctx.fillRect(end.x - 5, end.y - 5, 10, 10);
        this.drawLine(ctx, start.x, start.y, end.x, end.y);
      }

      if (this.lineClosed != -1) {
        // Отрисовка замыкания фигуры
        const start = this.points[this.points.length - 1].coordinates;
        const end = this.points[this.lineClosed].coordinates;
        this.drawLine(ctx, start.x, start.y, end.x, end.y);

        // Закрашивание фигуры
        const canvasFill = document.querySelector(
          "#canvasFill"
        ) as HTMLCanvasElement;
        const ctxFill = canvasFill.getContext("2d") as CanvasRenderingContext2D;
        canvasFill.width = canvasFill.offsetWidth;
        canvasFill.height = canvasFill.offsetHeight;

        ctxFill.beginPath();
        ctxFill.fillStyle = "rgba(0, 0, 0, .5)";
        for (let point of this.points) {
          if (point.finished) {
            ctxFill.lineTo(point.coordinates.x, point.coordinates.y);
          }
        }
        ctxFill.fill();
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
