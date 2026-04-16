export const UNIT_PRICE_PER_M2 = 6_000_000;

export const FOUNDATION_RATIO = 0.5;
export const ROOF_RATIO = 0.5;

export const DEFAULT_SETBACKS = {
  front: 4.5,
  rear: 2,
  left: 0,
  right: 0,
} as const;

export const MIN_LOT_WIDTH = 3;
export const MAX_LOT_WIDTH = 20;
export const MIN_LOT_DEPTH = 5;
export const MAX_LOT_DEPTH = 60;
export const MIN_FLOORS = 1;
export const MAX_FLOORS = 5;

export const EXTERIOR_WALL_THICKNESS = 0.2;
export const INTERIOR_WALL_THICKNESS = 0.1;

export const GRID_STEP = 0.1;

export const MIN_ROOM_SIZES: Record<string, { width: number; depth: number }> = {
  master_bedroom:  { width: 3.0,  depth: 3.6 },
  bedroom:         { width: 2.7,  depth: 3.0 },
  bathroom:        { width: 1.2,  depth: 1.5 },
  living_room:     { width: 3.6,  depth: 4.2 },
  kitchen:         { width: 2.4,  depth: 3.0 },
  dining_room:     { width: 2.7,  depth: 3.0 },
  corridor:        { width: 1.0,  depth: 1.0 },
  stair_landing:   { width: 1.1,  depth: 2.0 },
  balcony:         { width: 1.2,  depth: 1.8 },
  storage:         { width: 1.0,  depth: 1.0 },
};

export const FLOOR_HEIGHT_M = 3.3;
export const MIN_CEILING_HEIGHT_M = 2.7;

export const MAX_CONSTRUCTION_COVERAGE_PCT = 75;
export const MAX_FLOOR_AREA_RATIO = 4.5;

export const STAIR = {
  MIN_RISER_MM: 140,
  MAX_RISER_MM: 190,
  MIN_TREAD_MM: 240,
  MAX_TREAD_MM: 320,
  MIN_WIDTH_M:  1.0,
  LANDING_WIDTH_M: 1.1,
} as const;
