import type { LayoutSkillInput, FloorDetail } from "./types";
import { SCHEMA_VERSION } from "./constants";

interface RawWizardData {
  metadata: {
    jobId:        number;
    projectName:  string;
    customerName?: string;
  };
  projectInfo: {
    lotWidth:  number;
    lotDepth:  number;
    floors:    number;
    bedrooms:  number;
    bathrooms: number;
    budget?:   number;
  };
  architecture?: {
    style:    string;
    category: string;
  };
  followupAnswers?: {
    garage?:    boolean;
    altarRoom?: boolean;
    office?:    boolean;
    skylight?:  boolean;
    backYard?:  boolean;
  };
  chatFacts?: {
    setback?:               number | null;
    buildLength?:           number | null;
    groundBuildArea?:       number | null;
    totalConstructionArea?: number | null;
    updatedBudget?:         number | null;
    userAcceptedBudget?:    boolean | null;
  };
  references?: Array<{
    id:                string;
    name:              string;
    type:              string;
    priority:          string;
    interpretationMode: string;
    appliesToFloors:   number[] | "all";
    url:               string;
    note?:             string;
  }>;
}

/** Distribute total bedrooms & bathrooms across floors. */
function distributeFloors(
  totalFloors:    number,
  totalBedrooms:  number,
  totalBathrooms: number,
  followup: NonNullable<RawWizardData["followupAnswers"]>
): FloorDetail[] {
  const details: FloorDetail[] = [];

  // Ground floor: living/service zone, no bedrooms
  const groundSpecial: string[] = [];
  if (followup.garage)   groundSpecial.push("garage");
  if (followup.backYard) groundSpecial.push("back_yard");
  if (followup.office && totalFloors === 1) groundSpecial.push("office");

  details.push({
    floor:   0,
    name:    "Tầng trệt",
    bedroom: totalFloors === 1 ? totalBedrooms : 0,
    wc:      1,
    special: groundSpecial,
  });

  if (totalFloors === 1) return details;

  // Upper floors: distribute remaining bedrooms
  const upperFloors = totalFloors - 1;
  const bedsPerFloor = Math.floor(totalBedrooms / upperFloors);
  const extraBeds    = totalBedrooms % upperFloors;

  // Distribute bathrooms: 1 on ground already, rest on upper floors
  const upperBaths     = Math.max(0, totalBathrooms - 1);
  const bathsPerFloor  = Math.floor(upperBaths / upperFloors);
  const extraBaths     = upperBaths % upperFloors;

  for (let i = 1; i <= upperFloors; i++) {
    const isTopFloor = i === upperFloors;
    const special: string[] = [];

    if (followup.skylight && i === 1)              special.push("shaft");
    if (followup.altarRoom && isTopFloor)          special.push("altar_room");
    if (followup.office && i === 1 && totalFloors > 1) special.push("office");
    if (isTopFloor && totalFloors > 2)             special.push("terrace");

    details.push({
      floor:   i,
      name:    i === 1 ? "Lầu 1" : `Lầu ${i}`,
      bedroom: bedsPerFloor + (i <= extraBeds ? 1 : 0),
      wc:      bathsPerFloor + (i <= extraBaths ? 1 : 0),
      special,
    });
  }

  return details;
}

/** Build a normalized LayoutSkillInput from raw wizard data. */
export function buildLayoutInput(raw: RawWizardData): LayoutSkillInput {
  const followup = raw.followupAnswers ?? {};
  const floorDetails = distributeFloors(
    raw.projectInfo.floors,
    raw.projectInfo.bedrooms,
    raw.projectInfo.bathrooms,
    followup,
  );

  const architectureStyle = raw.architecture?.style ?? "Hiện đại";
  const interiorStyle     = raw.architecture?.category ?? "townhouse";

  const hardReqs: Record<string, boolean> = {};
  const softReqs: Record<string, boolean> = {};
  if (followup.garage)    hardReqs["garage"]     = true;
  if (followup.altarRoom) softReqs["altar_room"] = true;
  if (followup.office)    softReqs["office"]     = true;
  if (followup.skylight)  softReqs["skylight"]   = true;
  if (followup.backYard)  softReqs["back_yard"]  = true;

  return {
    metadata: {
      jobId:         raw.metadata.jobId,
      projectName:   raw.metadata.projectName,
      customerName:  raw.metadata.customerName,
      unit:          "m",
      schemaVersion: SCHEMA_VERSION,
    },
    projectInfo: {
      buildingType:      "townhouse",
      lotWidth:          raw.projectInfo.lotWidth,
      lotDepth:          raw.projectInfo.lotDepth,
      floors:            raw.projectInfo.floors,
      budgetMillionVnd:  raw.projectInfo.budget,
    },
    architectureSelection: {
      architectureStyle,
      interiorStyle,
    },
    requirements: {
      hard: hardReqs,
      soft: softReqs,
      layoutRules: {
        stairType:       "l_shape",
        fixedStairCore:  true,
        requireShaft:    followup.skylight ?? false,
        allowWcUnderStair: true,
        parkingType:     followup.garage ? "car" : "none",
        frontSetback:    raw.chatFacts?.setback ?? 4.5,
        rearSetback:     2.0,
        leftSetback:     0,
        rightSetback:    0,
      },
    },
    floorDetails,
    references: (raw.references ?? []).map((r) => ({
      id:                r.id,
      name:              r.name,
      type:              r.type as import("./types").DocType,
      priority:          r.priority as import("./types").Priority,
      interpretationMode: r.interpretationMode as import("./types").InterpretMode,
      appliesToFloors:   r.appliesToFloors,
      url:               r.url,
      note:              r.note,
    })),
    chatFacts: raw.chatFacts,
  };
}

export type { RawWizardData };
