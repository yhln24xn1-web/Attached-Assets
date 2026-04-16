import { DEFAULT_SETBACKS, EXTERIOR_WALL_THICKNESS } from "./constants";
import { fail, pass, type RuleResult } from "./validators";
import {
  calcBuildableWidth,
  calcBuildableDepth,
  calcBuildableArea,
  calcGroundFloorArea,
  calcConstructionCoverage,
  calcFloorAreaRatio,
  calcTotalUsableFloorArea,
} from "./formulas";
import {
  validateConstructionCoverage,
  validateFloorAreaRatio,
} from "./validators";

export interface Setbacks {
  front: number;
  rear: number;
  left: number;
  right: number;
}

export interface SiteLayout {
  lotWidth: number;
  lotDepth: number;
  setbacks?: Partial<Setbacks>;
  floors: number;
  floorAreas?: number[];
}

export function getDefaultSetback(lotWidth: number): Setbacks {
  const front = lotWidth <= 5 ? 4.5 : 4.5;
  const rear = 2;
  const left = lotWidth <= 4 ? 0.5 : 0;
  const right = lotWidth <= 4 ? 0.5 : 0;
  return { front, rear, left, right };
}

export interface SiteLayoutResult {
  siteArea: number;
  buildableWidth: number;
  buildableDepth: number;
  buildableArea: number;
  groundFloorArea: number;
  coveragePct: number;
  totalUsableFloorArea: number;
  floorAreaRatio: number;
  setbacks: Setbacks;
}

export function calcSiteLayout(input: SiteLayout): SiteLayoutResult {
  const setbacks: Setbacks = {
    ...DEFAULT_SETBACKS,
    ...input.setbacks,
  };

  const usableWidth = calcBuildableWidth(input.lotWidth, setbacks.left, setbacks.right);
  const usableDepth = calcBuildableDepth(input.lotDepth, setbacks.front, setbacks.rear);
  const buildableArea = calcBuildableArea(usableWidth, usableDepth);
  const groundFloorArea = calcGroundFloorArea(usableWidth, usableDepth);
  const siteArea = input.lotWidth * input.lotDepth;
  const coveragePct = calcConstructionCoverage(groundFloorArea, siteArea);

  const floorAreas =
    input.floorAreas ?? Array.from({ length: input.floors }, () => groundFloorArea);
  const totalUsableFloorArea = calcTotalUsableFloorArea(floorAreas);
  const floorAreaRatio = calcFloorAreaRatio(totalUsableFloorArea, siteArea);

  return {
    siteArea,
    buildableWidth: usableWidth,
    buildableDepth: usableDepth,
    buildableArea,
    groundFloorArea,
    coveragePct,
    totalUsableFloorArea,
    floorAreaRatio,
    setbacks,
  };
}

export function validateSiteLayout(layout: SiteLayoutResult): RuleResult[] {
  const results: RuleResult[] = [];

  if (layout.buildableWidth < 2) {
    results.push(
      fail(
        "validateBuildableWidth",
        `Sau giật lùi còn ${layout.buildableWidth.toFixed(1)}m — quá hẹp để bố trí phòng`
      )
    );
  } else {
    results.push(pass("validateBuildableWidth"));
  }

  if (layout.buildableDepth < 4) {
    results.push(
      fail(
        "validateBuildableDepth",
        `Sau giật lùi còn ${layout.buildableDepth.toFixed(1)}m chiều sâu — quá ngắn`
      )
    );
  } else {
    results.push(pass("validateBuildableDepth"));
  }

  results.push(validateConstructionCoverage(layout.coveragePct));
  results.push(validateFloorAreaRatio(layout.floorAreaRatio));

  return results;
}

export function usableFootprint(
  lotWidth: number,
  lotDepth: number,
  setbacks?: Partial<Setbacks>
): { x: number; y: number; width: number; height: number } {
  const s: Setbacks = { ...DEFAULT_SETBACKS, ...setbacks };
  const x = s.left + EXTERIOR_WALL_THICKNESS;
  const y = s.front + EXTERIOR_WALL_THICKNESS;
  const width = Math.max(0, lotWidth - s.left - s.right - EXTERIOR_WALL_THICKNESS * 2);
  const height = Math.max(0, lotDepth - s.front - s.rear - EXTERIOR_WALL_THICKNESS * 2);
  return { x, y, width, height };
}
