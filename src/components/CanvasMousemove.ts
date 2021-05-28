function animationDrawingLine(self: any, x: number, y: number) {
  const canvas = self.$refs.canvas as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const lastLine = self.lines[self.lines.length - 1].main_line;
  const start = lastLine.points[self.indexStartPoint];

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  self.renderLine(ctx, start.x, start.y, x, y);
}

function dragPoint(self: any, x: number, y: number) {
  const { lines } = self;
  const currentLine = lines[self.movePoint.indexLine].main_line;
  const { points, attributes } = currentLine;
  const index = points.findIndex((element: IPointCoordinate, index: number) => {
    if (element.joinedDelta) {
      return { index };
    }
  });

  let { delta } = currentLine;

  self.movePoint.state = true;
  self.$store.dispatch("changeAction", "movePoint");

  // Сохранение изменения координат точки
  points[self.movePoint.index].x = x;
  points[self.movePoint.index].y = y;

  // Если это точка к которой привязана дельта, тогда перемещаем дельту
  if (
    index != -1 &&
    self.comparisonCordPoints(x, y, points[index].x, points[index].y)
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

  lines[self.movePoint.indexLine] = line;
  self.$store.dispatch("savePoint", lines);
}

function dragDelta(self: any, x: number, y: number) {
  const { lines } = self;
  const line = lines[self.indexDeltaLine].main_line;
  const points = line.points;
  const index = points.findIndex((element: IPointCoordinate, index: number) => {
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
  self.$store.dispatch("savePoint", lines);
  self.$store.dispatch("changeAction", "movePoint");
}

export { animationDrawingLine, dragPoint, dragDelta };
