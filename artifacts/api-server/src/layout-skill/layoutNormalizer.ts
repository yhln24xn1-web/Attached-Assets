import type { RawLayout, NormalizedLayout, NormalizedRoom, NormalizedFloor, LayoutSkillInput } from "./types";
import { CORE_ROOM_TYPES, ROOM_NAME_MAP } from "./constants";
import { GRID_STEP } from "../rules/constants";
import { snap } from "../rules/units";

/** Round dimension to grid step. */
function sg(v: number): number { return snap(Math.max(0, v), GRID_STEP); }

/** Compute room area. */
function area(width: number, depth: number): number {
  return Math.round(width * depth * 100) / 100;
}

/** Normalize a single room: snap coords, canonicalize name. */
function normalizeRoom(
  room: RawLayout["floors"][0]["rooms"][0],
  floorIdx: number,
): NormalizedRoom {
  const type = room.type;
  const name = ROOM_NAME_MAP[type] ?? room.name;
  return {
    ...room,
    name,
    x:     sg(room.x),
    y:     sg(room.y),
    width: sg(room.width),
    depth: sg(room.depth),
    floor: floorIdx,
    area:  area(sg(room.width), sg(room.depth)),
  };
}

/** Remove AI-hallucinated rooms not in floorDetails (allows core rooms). */
function filterRooms(
  rooms: NormalizedRoom[],
  floorDetail: LayoutSkillInput["floorDetails"][0],
): NormalizedRoom[] {
  const allowedBeds = floorDetail.bedroom;
  const allowedWc   = floorDetail.wc;
  const allowedSpec = new Set(floorDetail.special.map((s) => s.toLowerCase().replace("-", "_")));

  let bedCount = 0;
  let wcCount  = 0;

  return rooms.filter((r) => {
    if (CORE_ROOM_TYPES.has(r.type)) return true;

    if (r.type === "master_bedroom" || r.type === "bedroom") {
      if (bedCount < allowedBeds) { bedCount++; return true; }
      return false;
    }

    if (r.type === "bathroom") {
      if (wcCount < allowedWc) { wcCount++; return true; }
      return false;
    }

    if (r.type === "living_room" || r.type === "kitchen" || r.type === "dining_room") {
      return true; // always allowed on any floor
    }

    if (r.type === "garage") return allowedSpec.has("garage");

    if (allowedSpec.has(r.type)) return true;

    return false;
  });
}

/** Normalize the entire raw layout. */
export function normalizeLayout(
  raw:   RawLayout,
  input: LayoutSkillInput,
): NormalizedLayout {
  const bw = calcBuildableWidth(input);
  const bd = calcBuildableDepth(input);

  const floors: NormalizedFloor[] = raw.floors.map((rawFloor) => {
    const detail = input.floorDetails.find((d) => d.floor === rawFloor.floor)
      ?? { floor: rawFloor.floor, name: rawFloor.floorName, bedroom: 0, wc: 0, special: [] };

    const normalized = rawFloor.rooms.map((r) => normalizeRoom(r, rawFloor.floor));
    const filtered   = filterRooms(normalized, detail);

    return {
      floor:     rawFloor.floor,
      floorName: rawFloor.floorName,
      rooms:     filtered,
    };
  });

  return { floors, buildableWidth: bw, buildableDepth: bd };
}

/** Compute buildable width from input. */
function calcBuildableWidth(input: LayoutSkillInput): number {
  const pi = input.projectInfo;
  const lr = input.requirements.layoutRules;
  const left  = lr.leftSetback  ?? 0;
  const right = lr.rightSetback ?? 0;
  return Math.max(1, sg(pi.lotWidth - left - right - 0.4));
}

/** Compute buildable depth from input. */
function calcBuildableDepth(input: LayoutSkillInput): number {
  const pi = input.projectInfo;
  const lr = input.requirements.layoutRules;
  const front = lr.frontSetback ?? 4.5;
  const rear  = lr.rearSetback  ?? 2.0;
  return Math.max(1, sg(pi.lotDepth - front - rear - 0.4));
}

export { calcBuildableWidth, calcBuildableDepth };
