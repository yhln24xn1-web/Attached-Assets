import {
  MIN_LOT_WIDTH,
  MAX_LOT_WIDTH,
  MIN_LOT_DEPTH,
  MAX_LOT_DEPTH,
  MIN_FLOORS,
  MAX_FLOORS,
  MAX_CONSTRUCTION_COVERAGE_PCT,
  MAX_FLOOR_AREA_RATIO,
} from "./constants";

export interface RuleResult {
  ok: boolean;
  rule: string;
  reason?: string;
}

export function pass(rule: string): RuleResult {
  return { ok: true, rule };
}

export function fail(rule: string, reason: string): RuleResult {
  return { ok: false, rule, reason };
}

export function validateLotDimensions(
  lotWidth: number,
  lotDepth: number
): RuleResult {
  if (lotWidth < MIN_LOT_WIDTH || lotWidth > MAX_LOT_WIDTH) {
    return fail(
      "validateLotDimensions",
      `Chiều rộng lô ${lotWidth}m ngoài phạm vi [${MIN_LOT_WIDTH}–${MAX_LOT_WIDTH}]m`
    );
  }
  if (lotDepth < MIN_LOT_DEPTH || lotDepth > MAX_LOT_DEPTH) {
    return fail(
      "validateLotDimensions",
      `Chiều dài lô ${lotDepth}m ngoài phạm vi [${MIN_LOT_DEPTH}–${MAX_LOT_DEPTH}]m`
    );
  }
  return pass("validateLotDimensions");
}

export function validateFloorCount(floors: number): RuleResult {
  if (floors < MIN_FLOORS || floors > MAX_FLOORS) {
    return fail(
      "validateFloorCount",
      `Số tầng ${floors} ngoài phạm vi [${MIN_FLOORS}–${MAX_FLOORS}]`
    );
  }
  return pass("validateFloorCount");
}

export function validateConstructionCoverage(
  coveragePct: number
): RuleResult {
  if (coveragePct > MAX_CONSTRUCTION_COVERAGE_PCT) {
    return fail(
      "validateConstructionCoverage",
      `Mật độ xây dựng ${coveragePct.toFixed(1)}% vượt quá giới hạn ${MAX_CONSTRUCTION_COVERAGE_PCT}%`
    );
  }
  return pass("validateConstructionCoverage");
}

export function validateFloorAreaRatio(far: number): RuleResult {
  if (far > MAX_FLOOR_AREA_RATIO) {
    return fail(
      "validateFloorAreaRatio",
      `Hệ số sử dụng đất ${far.toFixed(2)} vượt giới hạn ${MAX_FLOOR_AREA_RATIO}`
    );
  }
  return pass("validateFloorAreaRatio");
}

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  id?: string;
};

export function validateNoOverlap(rects: Rect[]): RuleResult {
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i];
      const b = rects[j];
      if (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      ) {
        return fail(
          "validateNoOverlap",
          `Phòng "${a.id ?? i}" và "${b.id ?? j}" bị chồng lấn`
        );
      }
    }
  }
  return pass("validateNoOverlap");
}

export function validateInsideBoundary(
  room: Rect,
  boundary: { minX: number; minY: number; maxX: number; maxY: number }
): RuleResult {
  const inside =
    room.x >= boundary.minX &&
    room.y >= boundary.minY &&
    room.x + room.width <= boundary.maxX &&
    room.y + room.height <= boundary.maxY;
  if (!inside) {
    return fail(
      "validateInsideBoundary",
      `Phòng "${room.id ?? "unknown"}" nằm ngoài footprint`
    );
  }
  return pass("validateInsideBoundary");
}
