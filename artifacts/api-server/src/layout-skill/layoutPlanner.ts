import type { LayoutSkillInput, PlannedRoom, PlannedFloor, RawLayout, FloorDetail } from "./types";
import type { LayoutRuleBundle } from "./ruleBundle";
import { STAIR_PRESETS, DEFAULT_STAIR_TYPE, ROOM_NAME_MAP } from "./constants";
import { EXTERIOR_WALL_THICKNESS } from "../rules/constants";

interface Footprint {
  width: number;
  depth: number;
}

/** Map special key to room type string. */
function specialToType(s: string): string {
  const map: Record<string, string> = {
    garage:     "garage",
    back_yard:  "back_yard",
    altar_room: "altar_room",
    office:     "office",
    shaft:      "shaft",
    skylight:   "shaft",
    terrace:    "terrace",
    laundry:    "laundry",
  };
  return map[s] ?? s;
}

/** Get Vietnamese room name, falling back to type if unknown. */
function roomName(type: string, index = 0): string {
  const base = ROOM_NAME_MAP[type] ?? type;
  if (["bedroom", "bathroom"].includes(type) && index > 0) {
    return `${base} ${index + 1}`;
  }
  return base;
}

/** Round to 2 decimal places. */
function r2(v: number): number { return Math.round(v * 100) / 100; }

/** Plan ground floor rooms (front to rear). */
function planGroundFloor(
  detail:    FloorDetail,
  fp:        Footprint,
  stairX:    number,
  stairY:    number,
  stairW:    number,
  stairD:    number,
  hasGarage: boolean,
): PlannedRoom[] {
  const rooms: PlannedRoom[] = [];
  const bw  = fp.width;
  const bd  = fp.depth;
  let   y   = 0;

  // ── Stair core (fixed, rear) ─────────────────────────────────────────
  rooms.push({
    id: "f0_stair", type: "stair", name: "Cầu thang",
    x: stairX, y: stairY, width: stairW, depth: stairD,
    floor: 0, isFixed: true,
  });

  // ── Garage (front, full width) ───────────────────────────────────────
  if (hasGarage) {
    const garageD = r2(Math.min(5.0, stairY * 0.5));
    rooms.push({
      id: "f0_garage", type: "garage", name: "Gara xe",
      x: 0, y, width: bw, depth: garageD, floor: 0,
    });
    y += garageD;
  }

  // ── Living room ───────────────────────────────────────────────────────
  const livingD = r2(Math.min(4.5, stairY - y));
  if (livingD > 1) {
    rooms.push({
      id: "f0_living", type: "living_room", name: "Phòng khách",
      x: 0, y, width: bw, depth: livingD, floor: 0,
    });
    y += livingD;
  }

  // ── Kitchen + Dining side-by-side ─────────────────────────────────────
  const kdD  = r2(Math.min(3.5, stairY - y));
  if (kdD > 1) {
    const kitW  = r2(bw * 0.55);
    const dineW = r2(bw - kitW);
    rooms.push({
      id: "f0_kitchen", type: "kitchen", name: "Bếp",
      x: 0, y, width: kitW, depth: kdD, floor: 0,
    });
    rooms.push({
      id: "f0_dining", type: "dining_room", name: "Phòng ăn",
      x: kitW, y, width: dineW, depth: kdD, floor: 0,
    });
    y += kdD;
  }

  // ── Ground-floor WC (in stair column below stair) ────────────────────
  const wcY = stairY + stairD;
  const wcD = r2(Math.min(2.0, bd - wcY));
  if (wcD > 0.8) {
    rooms.push({
      id: "f0_wc", type: "bathroom", name: "WC",
      x: stairX, y: wcY, width: stairW, depth: wcD, floor: 0,
    });
  }

  // ── Special rooms on ground floor ────────────────────────────────────
  const usableW = stairX;
  for (let si = 0; si < detail.special.length; si++) {
    const sp   = detail.special[si];
    const type = specialToType(sp);
    if (type === "garage") continue; // already placed
    const spD = 3.0;
    rooms.push({
      id: `f0_sp${si}`, type, name: ROOM_NAME_MAP[type] ?? type,
      x: 0, y, width: usableW, depth: spD, floor: 0,
    });
    y += spD;
  }

  void bd; // prevent unused warning

  return rooms;
}

/** Plan one upper floor (index >= 1). */
function planUpperFloor(
  detail:  FloorDetail,
  fp:      Footprint,
  stairX:  number,
  stairY:  number,
  stairW:  number,
  stairD:  number,
  floorIdx: number,
): PlannedRoom[] {
  const rooms: PlannedRoom[] = [];
  const bw = fp.width;
  const bd = fp.depth;
  const usableW = stairX; // column left of stair
  let   y       = 0;
  const f       = floorIdx;

  // ── Stair core (same x/y as ground floor) ───────────────────────────
  rooms.push({
    id: `f${f}_stair`, type: "stair", name: "Cầu thang",
    x: stairX, y: stairY, width: stairW, depth: stairD,
    floor: f, isFixed: true,
  });

  // ── Corridor ──────────────────────────────────────────────────────────
  const corrD = 1.0;
  rooms.push({
    id: `f${f}_corridor`, type: "corridor", name: "Hành lang",
    x: 0, y, width: usableW, depth: corrD, floor: f,
  });
  y += corrD;

  const bdCount = detail.bedroom;
  const wcCount = detail.wc;

  // ── Master bedroom (first bedroom, floor 1 only) ─────────────────────
  if (bdCount > 0) {
    const masterH = r2(Math.min(4.5, stairY - y - 3.5));
    const isOnlyBed = bdCount === 1;
    const masterW = isOnlyBed ? usableW : r2(usableW * 0.55);
    rooms.push({
      id: `f${f}_bd0`, type: "master_bedroom", name: "Phòng ngủ chính",
      x: 0, y, width: masterW, depth: Math.max(masterH, 3.0), floor: f,
    });

    // WC adjacent to master (if available width)
    if (!isOnlyBed && wcCount > 0) {
      const adjW = r2(usableW - masterW);
      rooms.push({
        id: `f${f}_wc0`, type: "bathroom", name: "WC",
        x: masterW, y, width: adjW, depth: r2(Math.min(2.5, Math.max(masterH, 3.0))), floor: f,
      });
    }

    y += Math.max(masterH, 3.0);
  }

  // ── Remaining bedrooms ────────────────────────────────────────────────
  const remainBds  = Math.max(0, bdCount - 1);
  const perRow     = remainBds <= 2 ? remainBds : 2;
  if (remainBds > 0 && perRow > 0) {
    const bdW = r2(usableW / perRow);
    const bdD = r2(Math.min(3.8, (stairY - y) / Math.ceil(remainBds / perRow)));

    for (let i = 0; i < remainBds; i++) {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      rooms.push({
        id:    `f${f}_bd${i + 1}`,
        type:  "bedroom",
        name:  roomName("bedroom", i + 1),
        x:     col * bdW,
        y:     y + row * Math.max(bdD, 3.0),
        width: bdW,
        depth: Math.max(bdD, 3.0),
        floor: f,
      });
    }
    y += Math.ceil(remainBds / perRow) * Math.max(bdD, 3.0);
  }

  // ── Additional WC (below stair or in remaining space) ────────────────
  const startWcIdx = bdCount > 0 && !rooms.find((r) => r.id === `f${f}_wc0`) ? 0 : 1;
  const wcStairY   = stairY + stairD;
  const wcSpaceD   = r2(Math.min(2.0, bd - wcStairY));

  for (let i = startWcIdx; i < wcCount && wcSpaceD > 0.5; i++) {
    rooms.push({
      id: `f${f}_wc${i}`, type: "bathroom", name: roomName("bathroom", i),
      x: stairX, y: wcStairY + (i - startWcIdx) * 2.0,
      width: stairW, depth: r2(Math.min(2.0, wcSpaceD)), floor: f,
    });
  }

  // ── Special rooms ────────────────────────────────────────────────────
  for (let si = 0; si < detail.special.length; si++) {
    const sp   = detail.special[si];
    const type = specialToType(sp);
    const spD  = type === "terrace" ? 5.0 : 3.0;
    const spW  = type === "shaft" ? r2(stairW) : usableW;
    const spX  = type === "shaft" ? stairX     : 0;
    rooms.push({
      id: `f${f}_sp${si}`, type, name: ROOM_NAME_MAP[type] ?? type,
      x: spX, y, width: spW, depth: spD, floor: f,
    });
    if (type !== "shaft") y += spD;
  }

  void bw;
  return rooms;
}

/** Compute buildable footprint from project info + rules. */
function calcFootprint(input: LayoutSkillInput): Footprint {
  const pi = input.projectInfo;
  const lr = input.requirements.layoutRules;
  const frontS  = lr.frontSetback  ?? 4.5;
  const rearS   = lr.rearSetback   ?? 2.0;
  const leftS   = lr.leftSetback   ?? 0;
  const rightS  = lr.rightSetback  ?? 0;
  const walls2  = EXTERIOR_WALL_THICKNESS * 2;

  return {
    width: Math.max(1, pi.lotWidth  - leftS - rightS - walls2),
    depth: Math.max(1, pi.lotDepth  - frontS - rearS  - walls2),
  };
}

/** Main entry: plan all floors. */
export function planRawLayout(
  input:  LayoutSkillInput,
  bundle: LayoutRuleBundle,
): RawLayout {
  const fp     = calcFootprint(input);
  const lr     = input.requirements.layoutRules;
  const stType = lr.stairType ?? DEFAULT_STAIR_TYPE;
  const stPre  = STAIR_PRESETS[stType];

  // Stair core: right column, placed toward the rear
  const stairW = stPre.width;
  const stairD = stPre.depth;
  const stairX = r2(Math.max(0, fp.width - stairW));
  const stairY = r2(Math.max(0, fp.depth - stairD));

  const floors: PlannedFloor[] = input.floorDetails.map((detail) => {
    const isGround  = detail.floor === 0;
    const hasGarage = isGround && (input.requirements.hard["garage"] === true);

    const rooms = isGround
      ? planGroundFloor(detail, fp, stairX, stairY, stairW, stairD, hasGarage)
      : planUpperFloor(detail, fp, stairX, stairY, stairW, stairD, detail.floor);

    return { floor: detail.floor, floorName: detail.name, rooms };
  });

  void bundle; // bundle used for future AI integration

  return { floors };
}
