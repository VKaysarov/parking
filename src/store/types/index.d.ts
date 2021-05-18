type parkingPlaceMetaData = {
  placeNumber: number;
  forDisabledDrive: boolean;
};

type parkingPlaceCoordinateType = {
  x: number;
  y: number;
  positionNumber: number;
};

type parkingPlaceType = {
  coordinates: parkingPlaceCoordinateType;
  meta: parkingPlaceMetaData;
};

type parkingPlacesArrayType = parkingPlaceType[];
