interface IAttributesMainLine {
  parking_size: number;
  disabled: boolean;
};

interface ICoordinates {
  x: number;
  y: number;
};

interface IPointCoordinate extends ICoordinates { id: number };

interface IMainLine {
  points: IPointCoordinate[];
  delta: ICoordinates;
  attributes: IAttributesMainLine;
};

interface ILines {
  main_line: IMainLine;
};

type parkingPlacesArrayType = ILines[];
