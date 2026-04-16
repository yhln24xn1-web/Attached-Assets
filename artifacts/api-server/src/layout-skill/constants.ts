import type { StairType } from "./types";

// ── Stair footprint presets (metres) ─────────────────────────────────────────

export const STAIR_PRESETS: Record<StairType, { width: number; depth: number }> = {
  u_shape:  { width: 2.2, depth: 3.8 },
  l_shape:  { width: 1.2, depth: 3.8 },
  straight: { width: 1.2, depth: 5.4 },
};

export const DEFAULT_STAIR_TYPE: StairType = "l_shape";

// ── Core room types (always valid, not checked against floorDetail count) ─────

export const CORE_ROOM_TYPES = new Set([
  "stair", "shaft", "elevator", "corridor", "balcony",
  "void", "landing", "service",
]);

// ── Vietnamese room name map ──────────────────────────────────────────────────

export const ROOM_NAME_MAP: Record<string, string> = {
  stair:          "Cầu thang",
  corridor:       "Hành lang",
  shaft:          "Giếng trời",
  elevator:       "Thang máy",
  balcony:        "Ban công",
  void:           "Khoảng void",
  landing:        "Chiếu nghỉ",
  service:        "Khu dịch vụ",
  garage:         "Gara xe",
  living_room:    "Phòng khách",
  kitchen:        "Bếp",
  dining_room:    "Phòng ăn",
  master_bedroom: "Phòng ngủ chính",
  bedroom:        "Phòng ngủ",
  bathroom:       "WC",
  altar_room:     "Phòng thờ",
  office:         "Phòng làm việc",
  skylight:       "Giếng trời",
  back_yard:      "Sân sau",
  storage:        "Phòng kho",
  laundry:        "Phòng giặt",
  terrace:        "Sân thượng",
};

// ── Room colour for SVG rendering (frontend reads these from finalCleanJson) ──

export const ROOM_COLOR_MAP: Record<string, string> = {
  stair:          "rgba(160,174,192,0.25)",
  corridor:       "rgba(255,255,255,0.06)",
  shaft:          "rgba(99,235,224,0.18)",
  elevator:       "rgba(160,174,192,0.2)",
  balcony:        "rgba(154,230,180,0.2)",
  garage:         "rgba(200,140,60,0.25)",
  living_room:    "rgba(255,123,0,0.25)",
  kitchen:        "rgba(251,191,36,0.25)",
  dining_room:    "rgba(252,211,77,0.2)",
  master_bedroom: "rgba(99,179,237,0.3)",
  bedroom:        "rgba(99,179,237,0.2)",
  bathroom:       "rgba(56,178,172,0.25)",
  altar_room:     "rgba(214,158,46,0.25)",
  office:         "rgba(154,117,214,0.25)",
  back_yard:      "rgba(154,230,180,0.15)",
  storage:        "rgba(160,174,192,0.15)",
  terrace:        "rgba(154,230,180,0.18)",
};

// ── Floor priority: which room types belong on which floor ────────────────────

export const PRIORITY_BY_FLOOR: Record<number, string[]> = {
  0: ["garage", "living_room", "kitchen", "dining_room", "bathroom", "office"],
  1: ["master_bedroom", "bedroom", "bathroom", "altar_room"],
  2: ["bedroom", "bathroom", "altar_room", "storage"],
  3: ["bedroom", "bathroom", "storage", "terrace"],
  4: ["terrace", "storage"],
};

// ── Schema version ────────────────────────────────────────────────────────────

export const SCHEMA_VERSION = "1.0.0";

// ── Snap grid ─────────────────────────────────────────────────────────────────

export const GRID_STEP = 0.1;
