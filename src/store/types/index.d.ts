type parkingPlaceMetaData = {
  parking_size: number;
  disabled: boolean;
};

type pointCoordinateType = {
  id: number;
  x: number;
  y: number;
};

type deltaCoordinateType = {
  x: number;
  y: number;
};

type mainLineType = {
  points: pointCoordinateType[];
  delta: deltaCoordinateType;
  attributes: parkingPlaceMetaData;
};

type parkingPlaceType = {
  main_line: mainLineType;
};

type parkingPlacesArrayType = parkingPlaceType[];
