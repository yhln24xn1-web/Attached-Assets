import {
  UNIT_PRICE_PER_M2,
  FOUNDATION_RATIO,
  ROOF_RATIO,
  EXTERIOR_WALL_THICKNESS,
} from "./constants";

export function calcSiteArea(lotWidth: number, lotDepth: number): number {
  return lotWidth * lotDepth;
}

export function calcBuildableWidth(
  lotWidth: number,
  leftSetback: number,
  rightSetback: number
): number {
  return Math.max(0, lotWidth - leftSetback - rightSetback - EXTERIOR_WALL_THICKNESS * 2);
}

export function calcBuildableDepth(
  lotDepth: number,
  frontSetback: number,
  rearSetback: number
): number {
  return Math.max(0, lotDepth - frontSetback - rearSetback - EXTERIOR_WALL_THICKNESS * 2);
}

export function calcBuildableArea(buildableWidth: number, buildableDepth: number): number {
  return buildableWidth * buildableDepth;
}

export function calcGroundFloorArea(groundWidth: number, groundDepth: number): number {
  return groundWidth * groundDepth;
}

export function calcTotalUsableFloorArea(floorAreas: number[]): number {
  return floorAreas.reduce((sum, a) => sum + a, 0);
}

export function calcFloorAreaRatio(
  totalUsableFloorArea: number,
  siteArea: number
): number {
  if (siteArea === 0) return 0;
  return totalUsableFloorArea / siteArea;
}

export function calcConstructionCoverage(
  groundFloorArea: number,
  siteArea: number
): number {
  if (siteArea === 0) return 0;
  return (groundFloorArea / siteArea) * 100;
}

export function calcBmtTongDienTich(
  dienTichSan: number,
  floors: number
): number {
  const heSoMong = dienTichSan * FOUNDATION_RATIO;
  const heSoMai = dienTichSan * ROOF_RATIO;
  return heSoMong + dienTichSan * floors + heSoMai;
}

export function calcNganSachTrieu(tongDienTich: number): number {
  return Math.round((tongDienTich * UNIT_PRICE_PER_M2) / 1_000_000);
}

export function calcEstimatedCostPerM2(
  budgetVnd: number,
  totalUsableFloorArea: number
): number {
  if (totalUsableFloorArea === 0) return 0;
  return budgetVnd / totalUsableFloorArea;
}

export function calcRoomArea(width: number, height: number): number {
  return width * height;
}
