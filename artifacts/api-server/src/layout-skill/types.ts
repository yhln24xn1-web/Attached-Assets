// ── Input ─────────────────────────────────────────────────────────────────────

export type BuildingType = "townhouse" | "villa" | "office" | "shophouse" | "house";
export type StairType    = "u_shape" | "l_shape" | "straight";
export type Priority     = "low" | "medium" | "high" | "strict";
export type InterpretMode = "reference_only" | "layout_source" | "strict_source";
export type DocType =
  | "site_photo" | "current_plan" | "reference_plan"
  | "cad_file"   | "budget_file"  | "video" | "other";

export interface FloorDetail {
  floor:   number;
  name:    string;
  bedroom: number;
  wc:      number;
  special: string[];
}

export interface ReferenceFile {
  id:                string;
  name:              string;
  type:              DocType;
  priority:          Priority;
  interpretationMode: InterpretMode;
  appliesToFloors:   number[] | "all";
  url:               string;
  note?:             string;
}

export interface LayoutRules {
  stairType?:       StairType;
  fixedStairCore?:  boolean;
  requireShaft?:    boolean;
  allowWcUnderStair?: boolean;
  parkingType?:     "car" | "motorbike" | "none";
  frontSetback?:    number;
  rearSetback?:     number;
  leftSetback?:     number;
  rightSetback?:    number;
}

export interface LayoutSkillInput {
  metadata: {
    jobId:         number;
    projectName:   string;
    customerName?: string;
    unit:          "m" | "mm";
    schemaVersion: string;
  };
  projectInfo: {
    buildingType:       BuildingType;
    lotWidth:           number;
    lotDepth:           number;
    floors:             number;
    budgetMillionVnd?:  number;
  };
  architectureSelection: {
    templateFamily?:  string;
    architectureStyle: string;
    interiorStyle:    string;
    roofType?:        string;
    priority?:        "function_first" | "facade_first" | "balanced";
  };
  requirements: {
    hard:        Record<string, boolean>;
    soft:        Record<string, boolean>;
    layoutRules: LayoutRules;
  };
  floorDetails:  FloorDetail[];
  references?:   ReferenceFile[];
  chatFacts?: {
    setback?:                 number | null;
    buildLength?:             number | null;
    groundBuildArea?:         number | null;
    totalConstructionArea?:   number | null;
    updatedBudget?:           number | null;
    userAcceptedBudget?:      boolean | null;
  };
}

// ── Intermediate: raw / planned rooms ─────────────────────────────────────────

export interface PlannedRoom {
  id:       string;
  type:     string;
  name:     string;
  x:        number;
  y:        number;
  width:    number;
  depth:    number;
  floor:    number;
  isFixed?: boolean;
  lockedDimensions?: boolean;
}

export interface PlannedFloor {
  floor:     number;
  floorName: string;
  rooms:     PlannedRoom[];
}

export interface RawLayout {
  floors: PlannedFloor[];
}

// ── Normalized ────────────────────────────────────────────────────────────────

export interface NormalizedRoom extends PlannedRoom {
  area: number;
}

export interface NormalizedFloor {
  floor:     number;
  floorName: string;
  rooms:     NormalizedRoom[];
}

export interface NormalizedLayout {
  floors:         NormalizedFloor[];
  buildableWidth: number;
  buildableDepth: number;
}

// ── Geometry ──────────────────────────────────────────────────────────────────

export interface GeomRoom {
  id:      string;
  type:    string;
  name:    string;
  x:       number;
  y:       number;
  width:   number;
  height:  number;
  area:    number;
  isFixed?: boolean;
  lockedDimensions?: boolean;
}

export interface GeomFloor {
  floor:     number;
  floorName: string;
  rooms:     GeomRoom[];
}

export interface GeomLayout {
  floors:         GeomFloor[];
  buildableWidth: number;
  buildableDepth: number;
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface LayoutSkillValidation {
  noRoomOverlap:        boolean;
  noStairOverlap:       boolean;
  widthFits:            boolean;
  depthFits:            boolean;
  roomCountCorrect:     boolean;
  wcCountCorrect:       boolean;
  stairCoreConsistent:  boolean;
  issues:               string[];
}

// ── Score ─────────────────────────────────────────────────────────────────────

export interface LayoutScore {
  total:            number;
  functionScore:    number;
  geometryScore:    number;
  consistencyScore: number;
  referenceScore:   number;
}

// ── Final clean JSON (frontend-compatible) ────────────────────────────────────

export interface FinalRoom {
  name:  string;
  type:  string;
  area:  number;
}

export interface FinalFloor {
  floor:     number;
  floorName: string;
  rooms:     FinalRoom[];
  geometry:  GeomRoom[];
}

export interface FinalCleanJson {
  jobId:          number;
  buildableWidth: number;
  buildableDepth: number;
  floors:         FinalFloor[];
}

// ── Output ────────────────────────────────────────────────────────────────────

export interface LayoutSkillOutput {
  rawLayout:        RawLayout;
  normalizedLayout: NormalizedLayout;
  geometry:         GeomLayout;
  validation:       LayoutSkillValidation;
  finalCleanJson:   FinalCleanJson | null;
  score:            LayoutScore;
  passed:           boolean;
}
