function renderMainLine(
  ctx: CanvasRenderingContext2D,
  points: IPointCoordinate[]
): void {
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

function renderAreaLine(
  ctx: CanvasRenderingContext2D,
  mainLine: IMainLine
): void {
  const path = new Path2D();

  mainLine.attributes.path = path;

  for (let i = 0; i < mainLine.points.length; i++) {
    const end = mainLine.points[i];
    const x = end.x - mainLine.delta.len.x;
    const y = end.y - mainLine.delta.len.y;

    ctx.fillStyle = "rgba(0, 200, 200, .5)";
    path.lineTo(x, y);
  }
  for (let i = mainLine.points.length - 1; i >= 0; i--) {
    const end = mainLine.points[i];
    const x = end.x + mainLine.delta.len.x;
    const y = end.y + mainLine.delta.len.y;

    path.lineTo(x, y);
  }
  ctx.fill(path);
}

function renderDelta(
  self: any,
  ctx: CanvasRenderingContext2D,
  mainLine: IMainLine
): void {
  const index = mainLine.points.findIndex((element, index) => {
    if (element.joinedDelta) {
      return { index };
    }
  });

  if (index != -1) {
    const circle = new Path2D();
    const pointX = mainLine.points[index].x;
    const pointY = mainLine.points[index].y;
    const reverseDelta = {
      x: pointX + mainLine.delta.len.x,
      y: pointY + mainLine.delta.len.y,
    };

    ctx.lineWidth = 2;
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "chartreuse";

    // Рисование основной линии дельты
    self.renderLine(ctx, pointX, pointY, mainLine.delta.x, mainLine.delta.y);

    // Рисование точки дельты
    circle.arc(mainLine.delta.x, mainLine.delta.y, 5, 0, 2 * Math.PI);
    ctx.fill(circle);

    // Отрисовка отзеркаленой линии дельты
    self.renderLine(ctx, pointX, pointY, reverseDelta.x, reverseDelta.y);
  }
}

export { renderMainLine, renderAreaLine, renderDelta };
