import type { Setbacks } from "../siteRules";

export interface BuildingPreset {
  name: string;
  defaultFloors: number;
  setbacks: Setbacks;
  maxCoveragePct: number;
  maxFar: number;
  minLotWidth: number;
  unitPricePerM2: number;
  recommendedRoomRatios: {
    living: number;
    bedroom: number;
    kitchen: number;
    bathroom: number;
  };
}

export const TOWNHOUSE_PRESET: BuildingPreset = {
  name: "Nhà phố",
  defaultFloors: 3,
  setbacks: {
    front: 4.5,
    rear: 2.0,
    left: 0,
    right: 0,
  },
  maxCoveragePct: 75,
  maxFar: 4.0,
  minLotWidth: 4,
  unitPricePerM2: 6_000_000,
  recommendedRoomRatios: {
    living:   0.25,
    bedroom:  0.40,
    kitchen:  0.15,
    bathroom: 0.10,
  },
};
