function addPointOnLine(self: any, x: number, y: number) {
  const { indexLine, indexPoint } = self.lineover(x, y);
  const points = self.lines[indexLine].main_line.points;
  const point = {
    id: points.length,
    x,
    y,
    joinedDelta: false,
  };

  points.splice(indexPoint, 0, point);

  self.lines[indexLine].main_line.points = points;
  self.$store.dispatch("savePoint", self.lines);

  return true;
}

function selectPointOnLine(self: any, x: number, y: number) {
  const { indexPoint, indexLine } = self.pointover(x, y);

  if (indexPoint != -1) {
    const { lines } = self;
    const currentLine = lines[indexLine].main_line;
    const delta = currentLine.delta;

    for (const point of currentLine.points) {
      point.joinedDelta = false;
    }

    currentLine.points[indexPoint].joinedDelta = true;
    currentLine.attributes.selected = true;
    delta.x = x - delta.len.x;
    delta.y = y - delta.len.y;

    self.indexStartPoint = indexPoint;
    self.indexStartLine = indexLine;

    return true;
  }
}

function drawLine(self: any, x: number, y: number) {
  const { lines } = self;
  const countLines = lines.length;
  const points = self.lines[countLines - 1].main_line.points;
  const point = {
    id: points.length,
    x,
    y,
    joinedDelta: false,
  };

  points.push(point);
  self.indexStartPoint++;
  self.lines[countLines - 1].main_line.points = points;
  self.$store.dispatch("savePoint", lines);
}

export { addPointOnLine, selectPointOnLine, drawLine };
