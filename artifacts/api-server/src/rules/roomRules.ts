import { MIN_ROOM_SIZES } from "./constants";
import { fail, pass, type RuleResult } from "./validators";

export type RoomType = keyof typeof MIN_ROOM_SIZES;

export interface RoomDimension {
  id: string;
  type: RoomType | string;
  widthM: number;
  depthM: number;
}

export function validateRoomMinSize(room: RoomDimension): RuleResult {
  const min = MIN_ROOM_SIZES[room.type as RoomType];
  if (!min) return pass("validateRoomMinSize");

  if (room.widthM < min.width) {
    return fail(
      "validateRoomMinSize",
      `Phòng "${room.id}" (${room.type}): rộng ${room.widthM}m < tối thiểu ${min.width}m`
    );
  }
  if (room.depthM < min.depth) {
    return fail(
      "validateRoomMinSize",
      `Phòng "${room.id}" (${room.type}): sâu ${room.depthM}m < tối thiểu ${min.depth}m`
    );
  }
  return pass("validateRoomMinSize");
}

export function validateBathroomCount(
  bedrooms: number,
  bathrooms: number
): RuleResult {
  const minWc = bedrooms <= 2 ? 1 : Math.ceil(bedrooms / 2);
  if (bathrooms < minWc) {
    return fail(
      "validateBathroomCount",
      `${bedrooms} phòng ngủ cần ít nhất ${minWc} WC (hiện có ${bathrooms})`
    );
  }
  return pass("validateBathroomCount");
}

export function validateRoomList(rooms: RoomDimension[]): RuleResult[] {
  return rooms.map(validateRoomMinSize);
}

export function getDefaultRoomCount(floors: number): {
  bedrooms: number;
  bathrooms: number;
} {
  if (floors === 1) return { bedrooms: 2, bathrooms: 1 };
  if (floors === 2) return { bedrooms: 3, bathrooms: 2 };
  if (floors === 3) return { bedrooms: 4, bathrooms: 3 };
  return { bedrooms: floors + 1, bathrooms: Math.ceil((floors + 1) / 2) };
}
