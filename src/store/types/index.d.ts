interface IAttributesMainLine {
  parking_size: number;
  disabled: boolean;
};

interface ICoordinates {
  x: number;
  y: number;
};

interface IDelta extends ICoordinates {
  len: ICoordinates;
};

interface IPointCoordinate extends ICoordinates {
  id: number;
  joinedDelta: boolean;
};

interface IMainLine {
  points: IPointCoordinate[];
  delta: IDelta;
  attributes: IAttributesMainLine;
};

interface ILines {
  main_line: IMainLine;
};

type parkingPlacesArrayType = ILines[];
