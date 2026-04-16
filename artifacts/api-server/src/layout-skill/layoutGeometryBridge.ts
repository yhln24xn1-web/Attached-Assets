import type { NormalizedLayout, GeomLayout, GeomRoom, GeomFloor } from "./types";

/** Convert a normalized room to a geometry room (depth → height). */
function toGeomRoom(r: import("./types").NormalizedRoom): GeomRoom {
  return {
    id:               r.id,
    type:             r.type,
    name:             r.name,
    x:                r.x,
    y:                r.y,
    width:            r.width,
    height:           r.depth,
    area:             r.area,
    isFixed:          r.isFixed,
    lockedDimensions: r.lockedDimensions,
  };
}

/** Bridge: normalized layout → geometry layout. */
export function generateGeometry(normalized: NormalizedLayout): GeomLayout {
  const floors: GeomFloor[] = normalized.floors.map((nf) => {
    const rooms: GeomRoom[] = nf.rooms.map(toGeomRoom);
    return { floor: nf.floor, floorName: nf.floorName, rooms };
  });

  return {
    floors,
    buildableWidth: normalized.buildableWidth,
    buildableDepth: normalized.buildableDepth,
  };
}
