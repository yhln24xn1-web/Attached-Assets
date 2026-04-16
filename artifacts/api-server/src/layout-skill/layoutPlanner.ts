import type { LayoutSkillInput, PlannedRoom, PlannedFloor, RawLayout, FloorDetail } from "./types";
import type { LayoutRuleBundle } from "./ruleBundle";
import { STAIR_PRESETS, DEFAULT_STAIR_TYPE, ROOM_NAME_MAP } from "./constants";
import { EXTERIOR_WALL_THICKNESS } from "../rules/constants";

interface Footprint { width: number; depth: number; }

/** Map special key to room type. */
function specialToType(s: string): string {
  const map: Record<string, string> = {
    garage: "garage", back_yard: "back_yard", altar_room: "altar_room",
    office: "office", shaft: "shaft", skylight: "shaft",
    terrace: "terrace", laundry: "laundry",
  };
  return map[s] ?? s;
}

/** Round to 2 decimal places. */
function r2(v: number): number { return Math.round(v * 100) / 100; }

/** Clamp value min..max. */
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// ── Ground floor ───────────────────────────────────────────────────────────────

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
  const bw   = fp.width;
  const bd   = fp.depth;
  let   y    = 0;

  // ── Stair core (fixed, rear-right) ──────────────────────────────────
  rooms.push({
    id: "f0_stair", type: "stair", name: "Cầu thang",
    x: stairX, y: stairY, width: stairW, depth: stairD,
    floor: 0, isFixed: true,
  });

  // ── Garage (front, full width) ────────────────────────────────────
  if (hasGarage) {
    const garageD = r2(clamp(5.0, 4.0, stairY * 0.5));
    rooms.push({
      id: "f0_garage", type: "garage", name: "Gara xe",
      x: 0, y, width: bw, depth: garageD, floor: 0,
    });
    y += garageD;
  }

  // ── Living room (main column only: x=0 to stairX) ─────────────────
  const usableW = stairX;
  const livingD = r2(clamp(4.0, 2.0, stairY - y - 5.0));
  if (livingD > 0) {
    rooms.push({
      id: "f0_living", type: "living_room", name: "Phòng khách",
      x: 0, y, width: usableW, depth: livingD, floor: 0,
    });
    y += livingD;
  }

  // ── Kitchen + Dining ───────────────────────────────────────────────
  const kdRemaining = r2(stairY - y - 2.5); // leave room for WC
  const kdD         = r2(clamp(3.0, 1.5, kdRemaining));
  if (kdD > 1) {
    const kitW  = r2(usableW * 0.55);
    const dineW = r2(usableW - kitW);
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

  // ── WC: place in main column (NOT in stair column) ─────────────────
  const wcH = r2(clamp(2.0, 1.2, r2(stairY - y)));
  if (wcH >= 1.2 && detail.wc > 0) {
    const wcW = r2(clamp(1.5, 1.0, usableW * 0.4));
    rooms.push({
      id: "f0_wc", type: "bathroom", name: "WC",
      x: r2(usableW - wcW), y, width: wcW, depth: wcH, floor: 0,
    });
    y += wcH;
  }

  // ── Special rooms: altar, office, back_yard, etc ────────────────
  for (let si = 0; si < detail.special.length; si++) {
    const sp   = detail.special[si];
    const type = specialToType(sp);
    if (type === "garage") continue; // already placed above
    const remainD = r2(stairY - y);
    if (remainD < 1.0) break;
    const spD = r2(clamp(3.0, 1.0, remainD));
    rooms.push({
      id: `f0_sp${si}`, type, name: ROOM_NAME_MAP[type] ?? type,
      x: 0, y, width: usableW, depth: spD, floor: 0,
    });
    y += spD;
  }

  void bd; void bw;
  return rooms;
}

// ── Upper floor ────────────────────────────────────────────────────────────────

function planUpperFloor(
  detail:   FloorDetail,
  fp:       Footprint,
  stairX:   number,
  stairY:   number,
  stairW:   number,
  stairD:   number,
  floorIdx: number,
): PlannedRoom[] {
  const rooms: PlannedRoom[] = [];
  const bw      = fp.width;
  const bd      = fp.depth;
  const usableW = stairX;
  let   y       = 0;
  const f       = floorIdx;

  // ── Stair core (fixed, same position as all floors) ─────────────
  rooms.push({
    id: `f${f}_stair`, type: "stair", name: "Cầu thang",
    x: stairX, y: stairY, width: stairW, depth: stairD,
    floor: f, isFixed: true,
  });

  // ── Corridor ─────────────────────────────────────────────────────
  const corrD = 1.0;
  rooms.push({
    id: `f${f}_corridor`, type: "corridor", name: "Hành lang",
    x: 0, y, width: usableW, depth: corrD, floor: f,
  });
  y += corrD;

  // ── Shaft (giếng trời): placed in STAIR COLUMN above the stair ─────
  // The stair column (x=stairX..bw) is empty above stairY — use it as void
  const shaftIdx = detail.special.findIndex((s) => s === "shaft" || s === "skylight");
  let shaftPlaced = false;
  if (shaftIdx >= 0 && stairY > corrD + 0.5) {
    // Span from corrD to stairY in the stair column
    const shaftY = r2(corrD);
    const shaftH = r2(stairY - corrD);
    rooms.push({
      id: `f${f}_shaft`, type: "shaft", name: "Giếng trời",
      x: stairX, y: shaftY, width: stairW, depth: shaftH, floor: f, isFixed: true,
    });
    shaftPlaced = true;
  }

  const bdCount   = detail.bedroom;
  const wcCount   = detail.wc;

  // ── Master bedroom (first bedroom) ───────────────────────────────
  if (bdCount > 0) {
    const masterH  = r2(clamp(4.5, 3.0, stairY - y - 3.0));
    const isOnly   = bdCount === 1;
    const masterW  = isOnly ? usableW : r2(usableW * 0.56);

    rooms.push({
      id: `f${f}_bd0`, type: "master_bedroom", name: "Phòng ngủ chính",
      x: 0, y, width: masterW, depth: masterH, floor: f,
    });

    // WC adjacent to master if room in column
    if (wcCount > 0) {
      const adjW = r2(usableW - masterW);
      const adjH = r2(clamp(2.5, 1.5, masterH));
      if (!isOnly && adjW > 0.8) {
        rooms.push({
          id: `f${f}_wc0`, type: "bathroom", name: "WC",
          x: masterW, y, width: adjW, depth: adjH, floor: f,
        });
      }
    }

    y += masterH;
  }

  // ── Remaining bedrooms ────────────────────────────────────────────
  const remainBds = Math.max(0, bdCount - 1);
  if (remainBds > 0) {
    const perRow   = remainBds <= 2 ? remainBds : 2;
    const rows     = Math.ceil(remainBds / perRow);
    const bdW      = r2(usableW / perRow);
    const totalBdH = r2(clamp(rows * 3.8, rows * 3.0, stairY - y));
    const bdH      = r2(totalBdH / rows);

    for (let i = 0; i < remainBds; i++) {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      rooms.push({
        id:    `f${f}_bd${i + 1}`,
        type:  "bedroom",
        name:  `Phòng ngủ ${i + 2}`,
        x:     r2(col * bdW),
        y:     r2(y + row * bdH),
        width: bdW,
        depth: bdH,
        floor: f,
      });
    }
    y += totalBdH;
  }

  // ── Additional WC (below master WC area, in main column) ──────────
  const startWcIdx = rooms.some((r) => r.id === `f${f}_wc0`) ? 1 : 0;
  for (let i = startWcIdx; i < wcCount; i++) {
    const wcW = r2(clamp(1.5, 1.0, usableW / 2));
    const wcH = r2(clamp(2.0, 1.2, stairY - y));
    if (wcH < 1.0) break;
    rooms.push({
      id: `f${f}_wc${i}`, type: "bathroom", name: `WC ${i + 1}`,
      x: r2(i % 2 === 0 ? 0 : wcW), y, width: wcW, depth: wcH, floor: f,
    });
    if (i % 2 === 1 || i === wcCount - 1) y += wcH;
  }

  // ── Other special rooms (not shaft, not garage) ────────────────
  for (let si = 0; si < detail.special.length; si++) {
    if (si === shaftIdx && shaftPlaced) continue;
    const sp   = detail.special[si];
    const type = specialToType(sp);
    if (type === "shaft") continue; // handled above
    const remainD = r2(stairY - y);
    if (remainD < 1.0) break;
    const spH = r2(clamp(type === "terrace" ? 5.0 : 3.0, 1.0, remainD));
    rooms.push({
      id: `f${f}_sp${si}`, type, name: ROOM_NAME_MAP[type] ?? type,
      x: 0, y, width: usableW, depth: spH, floor: f,
    });
    y += spH;
  }

  void bw; void bd;
  return rooms;
}

// ── Footprint calculation ──────────────────────────────────────────────────────

function calcFootprint(input: LayoutSkillInput): Footprint {
  const pi   = input.projectInfo;
  const lr   = input.requirements.layoutRules;
  const walls2 = EXTERIOR_WALL_THICKNESS * 2;
  return {
    width: Math.max(1, r2(pi.lotWidth - (lr.leftSetback ?? 0) - (lr.rightSetback ?? 0) - walls2)),
    depth: Math.max(1, r2(pi.lotDepth - (lr.frontSetback ?? 4.5) - (lr.rearSetback ?? 2.0) - walls2)),
  };
}

// ── Main entry ────────────────────────────────────────────────────────────────

export function planRawLayout(
  input:  LayoutSkillInput,
  bundle: LayoutRuleBundle,
): RawLayout {
  const fp     = calcFootprint(input);
  const lr     = input.requirements.layoutRules;
  const stType = lr.stairType ?? DEFAULT_STAIR_TYPE;
  const stPre  = STAIR_PRESETS[stType];

  const stairW = stPre.width;
  const stairD = stPre.depth;
  // Place stair at rear-right corner
  const stairX = r2(Math.max(0, fp.width  - stairW));
  const stairY = r2(Math.max(0, fp.depth  - stairD));

  const floors: PlannedFloor[] = input.floorDetails.map((detail) => {
    const isGround  = detail.floor === 0;
    const hasGarage = isGround && (input.requirements.hard["garage"] === true);

    const rooms = isGround
      ? planGroundFloor(detail, fp, stairX, stairY, stairW, stairD, hasGarage)
      : planUpperFloor(detail, fp, stairX, stairY, stairW, stairD, detail.floor);

    return { floor: detail.floor, floorName: detail.name, rooms };
  });

  void bundle;
  return { floors };
}
