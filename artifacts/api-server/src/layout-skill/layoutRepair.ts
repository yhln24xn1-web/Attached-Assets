import type { GeomLayout, GeomRoom, LayoutSkillValidation } from "./types";
import { GRID_STEP } from "../rules/constants";
import { snap } from "../rules/units";

const TOLERANCE = 0.05;

/** Snap value to grid. */
function sg(v: number): number { return snap(Math.max(0, v), GRID_STEP); }

/** Check if two rects overlap. */
function overlaps(a: GeomRoom, b: GeomRoom): boolean {
  return (
    a.x < b.x + b.width - TOLERANCE &&
    a.x + a.width > b.x + TOLERANCE &&
    a.y < b.y + b.height - TOLERANCE &&
    a.y + a.height > b.y + TOLERANCE
  );
}

/** Push room B away from room A along the shorter axis. */
function deOverlap(fixed: GeomRoom, movable: GeomRoom): GeomRoom {
  const overlapX = Math.min(fixed.x + fixed.width,  movable.x + movable.width)  - Math.max(fixed.x, movable.x);
  const overlapY = Math.min(fixed.y + fixed.height, movable.y + movable.height) - Math.max(fixed.y, movable.y);

  if (overlapX <= 0 || overlapY <= 0) return movable;

  if (overlapX < overlapY) {
    // Push horizontally
    const newX = fixed.x + fixed.width > movable.x
      ? sg(fixed.x + fixed.width)
      : sg(movable.x - overlapX);
    return { ...movable, x: newX };
  } else {
    // Push vertically
    const newY = fixed.y + fixed.height > movable.y
      ? sg(fixed.y + fixed.height)
      : sg(movable.y - overlapY);
    return { ...movable, y: newY };
  }
}

/** Clamp room inside boundary. */
function clampToBoundary(room: GeomRoom, bw: number, bd: number): GeomRoom {
  const x = sg(Math.max(0, Math.min(room.x, bw - room.width)));
  const y = sg(Math.max(0, Math.min(room.y, bd - room.height)));
  return { ...room, x, y };
}

/** Repair a single floor's rooms. */
function repairFloor(
  rooms: GeomRoom[],
  bw:    number,
  bd:    number,
): GeomRoom[] {
  // Separate fixed (stair) from movable rooms
  const fixed   = rooms.filter((r) => r.isFixed);
  let   movable = rooms.filter((r) => !r.isFixed);

  // Step 1: clamp all rooms to boundary
  movable = movable.map((r) => clampToBoundary(r, bw, bd));

  // Step 2: de-overlap movable rooms against fixed rooms (up to 3 passes)
  for (let pass = 0; pass < 3; pass++) {
    for (const fix of fixed) {
      movable = movable.map((r) =>
        overlaps(fix, r) ? clampToBoundary(deOverlap(fix, r), bw, bd) : r,
      );
    }

    // De-overlap movable rooms against each other (preserve earlier rooms)
    for (let i = 0; i < movable.length; i++) {
      for (let j = i + 1; j < movable.length; j++) {
        if (overlaps(movable[i], movable[j])) {
          movable[j] = clampToBoundary(deOverlap(movable[i], movable[j]), bw, bd);
        }
      }
    }
  }

  return [...fixed, ...movable];
}

/** Repair the full geometry layout.
 *  Rules:
 *  - Fixed (stair) rooms are NEVER moved or resized.
 *  - Room width/height is NEVER changed if lockedDimensions=true.
 *  - Only x/y are adjusted, snapped to grid.
 */
export function repairLayout(
  geom:       GeomLayout,
  validation: LayoutSkillValidation,
): GeomLayout {
  // If already clean, return as-is
  const needsRepair =
    !validation.noRoomOverlap ||
    !validation.noStairOverlap ||
    !validation.widthFits ||
    !validation.depthFits;

  if (!needsRepair) return geom;

  const bw = geom.buildableWidth;
  const bd = geom.buildableDepth;

  const floors = geom.floors.map((gf) => ({
    ...gf,
    rooms: repairFloor(gf.rooms, bw, bd),
  }));

  return { ...geom, floors };
}
