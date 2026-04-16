import type { BuildingPreset } from "./townhouse";

export const VILLA_PRESET: BuildingPreset = {
  name: "Biệt thự",
  defaultFloors: 2,
  setbacks: {
    front: 6.0,
    rear: 4.0,
    left: 3.0,
    right: 3.0,
  },
  maxCoveragePct: 40,
  maxFar: 1.5,
  minLotWidth: 10,
  unitPricePerM2: 8_000_000,
  recommendedRoomRatios: {
    living:   0.28,
    bedroom:  0.38,
    kitchen:  0.14,
    bathroom: 0.12,
  },
};
