import type { BuildingPreset } from "./townhouse";

export const OFFICE_PRESET: BuildingPreset = {
  name: "Văn phòng / Thương mại",
  defaultFloors: 4,
  setbacks: {
    front: 6.0,
    rear: 3.0,
    left: 0,
    right: 0,
  },
  maxCoveragePct: 80,
  maxFar: 5.0,
  minLotWidth: 5,
  unitPricePerM2: 7_500_000,
  recommendedRoomRatios: {
    living:   0.50,
    bedroom:  0.10,
    kitchen:  0.10,
    bathroom: 0.08,
  },
};
