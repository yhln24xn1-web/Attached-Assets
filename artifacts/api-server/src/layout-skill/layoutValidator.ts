import type { GeomLayout, LayoutSkillInput, LayoutSkillValidation } from "./types";
import { validateNoOverlap, validateInsideBoundary, type Rect } from "../rules/validators";

/** Convert GeomRoom to Rect for rule functions. */
function toRect(r: GeomLayout["floors"][0]["rooms"][0]): Rect {
  return { x: r.x, y: r.y, width: r.width, height: r.height, id: r.id };
}

/** Validate one floor's rooms against boundary + overlap. */
function validateFloor(
  gf: GeomLayout["floors"][0],
  bw: number,
  bd: number,
): string[] {
  const issues: string[] = [];
  const boundary = { minX: 0, minY: 0, maxX: bw, maxY: bd };

  const allRects  = gf.rooms.map(toRect);
  const stairRects = gf.rooms.filter((r) => r.type === "stair").map(toRect);

  const overlapResult = validateNoOverlap(allRects);
  if (!overlapResult.ok) issues.push(`Tầng ${gf.floor}: ${overlapResult.reason}`);

  const stairOverlap = stairRects.length > 1 ? validateNoOverlap(stairRects) : null;
  if (stairOverlap && !stairOverlap.ok) {
    issues.push(`Tầng ${gf.floor} stair: ${stairOverlap.reason}`);
  }

  for (const room of gf.rooms) {
    const result = validateInsideBoundary(toRect(room), boundary);
    if (!result.ok) issues.push(`Tầng ${gf.floor}: ${result.reason}`);
  }

  return issues;
}

/** Check stair core position is consistent across all floors. */
function checkStairConsistency(geom: GeomLayout): string[] {
  const issues: string[] = [];
  const stairByFloor = geom.floors.map((gf) =>
    gf.rooms.find((r) => r.type === "stair"),
  );

  const reference = stairByFloor[0];
  if (!reference) return ["Không tìm thấy cầu thang ở tầng trệt"];

  for (let i = 1; i < stairByFloor.length; i++) {
    const st = stairByFloor[i];
    if (!st) {
      issues.push(`Tầng ${i}: thiếu cầu thang`);
      continue;
    }
    const dx = Math.abs(st.x - reference.x);
    const dy = Math.abs(st.y - reference.y);
    const dw = Math.abs(st.width - reference.width);
    const dh = Math.abs(st.height - reference.height);
    if (dx > 0.05 || dy > 0.05 || dw > 0.05 || dh > 0.05) {
      issues.push(
        `Tầng ${i}: vị trí cầu thang không đồng nhất ` +
        `(x=${st.x} vs ${reference.x}, y=${st.y} vs ${reference.y})`,
      );
    }
  }

  return issues;
}

/** Check room and WC counts per floor. */
function checkCounts(
  geom:  GeomLayout,
  input: LayoutSkillInput,
): { roomOk: boolean; wcOk: boolean; issues: string[] } {
  const issues: string[] = [];
  let roomOk = true;
  let wcOk   = true;

  for (const gf of geom.floors) {
    const detail = input.floorDetails.find((d) => d.floor === gf.floor);
    if (!detail) continue;

    const bedTypes  = ["master_bedroom", "bedroom"];
    const actualBed = gf.rooms.filter((r) => bedTypes.includes(r.type)).length;
    const actualWc  = gf.rooms.filter((r) => r.type === "bathroom").length;

    if (actualBed !== detail.bedroom) {
      issues.push(
        `Tầng ${gf.floor}: cần ${detail.bedroom} PN, có ${actualBed}`,
      );
      roomOk = false;
    }
    if (actualWc !== detail.wc) {
      issues.push(
        `Tầng ${gf.floor}: cần ${detail.wc} WC, có ${actualWc}`,
      );
      wcOk = false;
    }
  }

  return { roomOk, wcOk, issues };
}

/** Full layout validation. */
export function validateLayout(
  geom:  GeomLayout,
  input: LayoutSkillInput,
): LayoutSkillValidation {
  const bw = geom.buildableWidth;
  const bd = geom.buildableDepth;
  const issues: string[] = [];

  let noRoomOverlap  = true;
  let noStairOverlap = true;
  let widthFits      = true;
  let depthFits      = true;

  // Per-floor geometry checks
  for (const gf of geom.floors) {
    const floorIssues = validateFloor(gf, bw, bd);
    floorIssues.forEach((msg) => {
      if (msg.includes("chồng lấn")) {
        if (msg.includes("stair")) noStairOverlap = false;
        else noRoomOverlap = false;
      }
      if (msg.includes("ngoài footprint")) {
        const maxX = Math.max(...gf.rooms.map((r) => r.x + r.width));
        const maxY = Math.max(...gf.rooms.map((r) => r.y + r.height));
        if (maxX > bw + 0.01) widthFits = false;
        if (maxY > bd + 0.01) depthFits = false;
      }
    });
    issues.push(...floorIssues);
  }

  // Stair consistency
  const stairIssues = checkStairConsistency(geom);
  issues.push(...stairIssues);

  // Counts
  const { roomOk, wcOk, issues: countIssues } = checkCounts(geom, input);
  issues.push(...countIssues);

  return {
    noRoomOverlap,
    noStairOverlap,
    widthFits,
    depthFits,
    roomCountCorrect:    roomOk,
    wcCountCorrect:      wcOk,
    stairCoreConsistent: stairIssues.length === 0,
    issues,
  };
}

/** Check if a validation is fully passing. */
export function isPassing(v: LayoutSkillValidation): boolean {
  return (
    v.noRoomOverlap &&
    v.noStairOverlap &&
    v.widthFits &&
    v.depthFits &&
    v.roomCountCorrect &&
    v.wcCountCorrect &&
    v.stairCoreConsistent
  );
}
