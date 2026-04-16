import { type Rect, validateNoOverlap, validateInsideBoundary, type RuleResult, pass, fail } from "./validators";

export interface FloorLayout {
  floorIndex: number;
  rooms: Rect[];
  stairs: Rect[];
  boundary: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface QAReport {
  isCleanJson: boolean;
  passed: string[];
  failed: { rule: string; reason: string }[];
}

export function runFloorQA(floor: FloorLayout): QAReport {
  const results: RuleResult[] = [];
  const all: Rect[] = [...floor.rooms, ...floor.stairs];

  results.push(validateNoOverlap(all));
  results.push(validateNoOverlap(floor.stairs));

  for (const room of floor.rooms) {
    results.push(validateInsideBoundary(room, floor.boundary));
  }
  for (const stair of floor.stairs) {
    results.push(validateInsideBoundary(stair, floor.boundary));
  }

  if (floor.rooms.length === 0) {
    results.push(fail("validateHasRooms", `Tầng ${floor.floorIndex} không có phòng`));
  } else {
    results.push(pass("validateHasRooms"));
  }

  const passed = results.filter((r) => r.ok).map((r) => r.rule);
  const failed = results
    .filter((r) => !r.ok)
    .map((r) => ({ rule: r.rule, reason: r.reason ?? "" }));

  return {
    isCleanJson: failed.length === 0,
    passed,
    failed,
  };
}

export function runProjectQA(floors: FloorLayout[]): QAReport {
  const allPassed: string[] = [];
  const allFailed: { rule: string; reason: string }[] = [];

  for (const floor of floors) {
    const report = runFloorQA(floor);
    allPassed.push(...report.passed.map((r) => `f${floor.floorIndex}:${r}`));
    allFailed.push(
      ...report.failed.map((f) => ({
        rule: `f${floor.floorIndex}:${f.rule}`,
        reason: f.reason,
      }))
    );
  }

  return {
    isCleanJson: allFailed.length === 0,
    passed: allPassed,
    failed: allFailed,
  };
}

export function referenceScore(file: {
  documentType: string;
  interpretationMode: string;
  priority: string;
  appliesToFloors: number[] | "all";
  targetFloor?: number;
}): number {
  const sourceWeight: Record<string, number> = {
    cad_file:       100,
    current_plan:    90,
    reference_plan:  70,
    site_photo:      60,
    budget_file:     40,
    video:           30,
    other:           10,
  };

  const priorityWeight: Record<string, number> = {
    strict: 40,
    high:   30,
    medium: 20,
    low:    10,
  };

  const interpretWeight: Record<string, number> = {
    strict_source:  30,
    layout_source:  20,
    reference_only:  0,
  };

  let floorWeight = 0;
  if (file.appliesToFloors === "all") {
    floorWeight = 10;
  } else if (
    file.targetFloor !== undefined &&
    (file.appliesToFloors as number[]).includes(file.targetFloor)
  ) {
    floorWeight = 20;
  }

  return (
    (sourceWeight[file.documentType] ?? 0) +
    (priorityWeight[file.priority] ?? 0) +
    (interpretWeight[file.interpretationMode] ?? 0) +
    floorWeight
  );
}

export function pickPrimaryReference<T extends Parameters<typeof referenceScore>[0]>(
  files: T[],
  targetFloor?: number
): T | undefined {
  if (files.length === 0) return undefined;
  return files
    .slice()
    .sort(
      (a, b) =>
        referenceScore({ ...b, targetFloor }) - referenceScore({ ...a, targetFloor })
    )[0];
}
