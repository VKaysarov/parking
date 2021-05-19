<template>
  <div>
    <canvas id="canvasFill" width="800" height="800">Not supported Canvas</canvas>
    <canvas id="canvasAnim" width="800" height="800">Not supported Canvas</canvas>
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
  </div>
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
      indexStartPoint: 0,
      lines: defaultPoints,
      moveLine: false,
      downPoint: false,
      visibleContextMenu: false,
      selectedPointPos: {x: -1, y: -1}
    };
  },
  methods: {
   startDraw(event: MouseEvent) {
      const canvas = document.querySelector("#canvasAnim") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      
      const lines = this.lines;
      const id = 0;
      const x = event.offsetX;
      const y = event.offsetY;
      const line = {
        main_line: {
          points: [{
            id,
            x,
            y,
          }],
          delta: {
            x: 0,
            y: 0,
          },
          attributes: {
            parking_size: 0,
            disabled: false
          }
        }
      }

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;


      lines.push(line);

      this.$store.dispatch("savePoint", lines);
      this.$store.dispatch("startDraw");
    },
    handleClick(event: MouseEvent) {
      this.visibleContextMenu = false;

      let x = event.offsetX;
      let y = event.offsetY;
      
      // Добавление точки на линию
      if (this.$store.state.addPoint && this.lines[0].main_line.points.length > 1) {
        const indexLine = this.lineover(x, y);
        const points = this.lines[0].main_line.points;
        const point = {
          id: this.lines[0].main_line.points.length,
          x,
          y,
        }
        points.splice(indexLine, 0, point)
        this.$store.dispatch("savePoint", points);
      }

      // Выбор точки на линии
      if (this.lines.length > 0) {
        let indexFoundPoint = this.pointover(x, y);
        if (
            indexFoundPoint != -1 && 
            this.selectedPointPos.x > this.lines[0].main_line.points[indexFoundPoint].x - 4 &&
            this.selectedPointPos.x < this.lines[0].main_line.points[indexFoundPoint].x + 4
          ) {
            this.indexStartPoint = indexFoundPoint
            this.$store.dispatch("startDraw");
            return "selescete";
          }
      }

      if (this.$store.state.drawLine) {

        // Добавление точек
        const points = this.lines[0].main_line.points;
        const point = {
          id: this.lines[0].main_line.points.length,
          x,
          y,
        }
        this.indexStartPoint++
        points.splice(this.indexStartPoint, 0, point);
        this.lines[0].main_line.points = points;
        const lines = this.lines;
        this.$store.dispatch("savePoint", lines);
      }
    },
    mousedownPoint(event: MouseEvent) {
      let x = event.offsetX;
      let y = event.offsetY;

      this.selectedPointPos = {x, y}; 

      if (this.lines.length > 0 && this.pointover(x, y) >= 0) {
        this.downPoint = true;
        this.indexMovePoint = this.pointover(x, y);
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
        let start = this.lines[0].main_line.points[this.indexStartPoint];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawLine(ctx, start.x, start.y, x, y);
      }
      
      // Если мы навелись мышкой на точку
      if (this.lines.length > 0 && this.pointover(x, y) >= 0) {
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
          let start = this.lines[0].main_line.points[this.indexMovePoint + 1];
          this.drawLine(ctx, start.x, start.y, x, y);
        // Если это последняя точка
        } else if (this.indexMovePoint == this.lines[0].main_line.points.length - 1) {
          let start = this.lines[0].main_line.points[this.indexMovePoint - 1];
          this.drawLine(ctx, start.x, start.y, x, y);
        } else {
          let start = this.lines[0].main_line.points[this.indexMovePoint - 1];
          let end = this.lines[0].main_line.points[this.indexMovePoint + 1];
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(x, y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }

        // Сохранение изменения положения точки
        const points = this.lines[0].main_line.points;
        points[this.indexMovePoint].x = x;
        points[this.indexMovePoint].y = y;
        this.$store.dispatch("savePoint", points);
      }
    },
    pointover(mouseX: number, mouseY: number) {
      console.log(this.lines)
      for (let [index, point] of this.lines[0].main_line.points.entries()) {
        // Сравнение координат мыши и точки
        if (
          // По оси X
          mouseX > point.x - 15 &&
          mouseX < point.x + 15 &&
          // По оси Y
          mouseY > point.y - 15 &&
          mouseY < point.y + 15
        ) {
          return index;
        }
      }
      return -1;
    },
    lineover(mouseX: number, mouseY: number) {
      for (let i = 0; i < this.lines[0].main_line.points.length; i++) {
        // Сравнение координат мыши и линии
        let startPoint = {id: 0, x: 0, y: 0};
        let endPoint = {id: 0, x: 0, y: 0};
        if (i == this.lines[0].main_line.points.length - 1) {
          startPoint = this.lines[0].main_line.points[i - 1];
          endPoint = this.lines[0].main_line.points[i];
        } else {
          startPoint = this.lines[0].main_line.points[i];
          endPoint = this.lines[0].main_line.points[i + 1];
        }
        // console.table({mouse: {x: mouseX, y: mouseY}, startPoint, endPoint})
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
          return i + 1;
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
      this.lines = this.$store.state.lines;

      const canvas = document.querySelector("#canvasAnim") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      // Отрисовка всех точек и линий
      if (this.lines.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        const start = this.lines[0].main_line.points[0];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.fillRect(start.x - 5, start.y - 5, 10, 10);
        for (let i = 1; i < this.lines[0].main_line.points.length; i++) {
          // const start = this.lines[0].main_line.points[i - 1];
          const end = this.lines[0].main_line.points[i];
          ctx.fillStyle = "green";
          // ctx.fillRect(start.x - 5, start.y - 5, 10, 10);
          ctx.fillRect(end.x - 5, end.y - 5, 10, 10);
          // this.drawLine(ctx, start.x, start.y, end.x, end.y);
          ctx.lineTo(end.x, end.y);
        }
        ctx.stroke();
      }

      if (this.lineClosed != -1) {
        // Отрисовка замыкания фигуры
        const start = this.lines[0].main_line.points[this.lines[0].main_line.points.length - 1];
        const end = this.lines[0].main_line.points[this.lineClosed];
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
        for (let point of this.lines[0].main_line.points) {
          ctxFill.lineTo(point.x, point.y);
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
