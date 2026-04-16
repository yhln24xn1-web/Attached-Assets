// ─────────────────────────────────────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────────────────────────────────────

export const UNIT_PRICE_PER_M2        = 6_000_000;   // VNĐ/m²
export const UNIT_COST_MILLION_PER_M2 = 6;            // triệu/m²

// ─────────────────────────────────────────────────────────────────────────────
// Step 1.1 — site area preview (no setback, uses full land length)
// ─────────────────────────────────────────────────────────────────────────────

export interface SiteCalcInput {
  lotWidth:  number;
  lotLength: number;
  floors:    number;
}

export interface SiteCalcResult {
  dienTichDat:   number;
  dienTichSan:   number;
  heSoMong:      number;
  heSoMai:       number;
  tongDienTich:  number;
  nganSachTrieu: number;
}

export function calcSite(input: SiteCalcInput): SiteCalcResult {
  const w = Number(input.lotWidth)  || 0;
  const l = Number(input.lotLength) || 0;
  const f = Number(input.floors)    || 0;

  const dienTichDat  = w * l;
  const dienTichSan  = dienTichDat;
  const heSoMong     = dienTichSan * 0.5;
  const heSoMai      = dienTichSan * 0.5;
  const tongDienTich = heSoMong + dienTichSan * f + heSoMai;
  const nganSachTrieu = Math.round((tongDienTich * UNIT_PRICE_PER_M2) / 1_000_000);

  return { dienTichDat, dienTichSan, heSoMong, heSoMai, tongDienTich, nganSachTrieu };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2.1 — construction calc with setback
// Formula: Móng (50%) + Thân (floors × 100%) + Mái (50%)
// ─────────────────────────────────────────────────────────────────────────────

export interface ConstructionCalcResult {
  buildLength:                 number;
  groundBuildArea:             number;
  foundationArea:              number;
  bodyArea:                    number;
  roofArea:                    number;
  totalConstructionArea:       number;
  updatedBudgetMillion:        number;
  estimatedUnitCostMillionPerM2: number;
}

export function calcConstruction(
  landWidth:  number,
  landLength: number,
  floors:     number,
  setback:    number
): ConstructionCalcResult {
  const buildLength      = landLength - setback;
  const groundBuildArea  = landWidth * buildLength;
  const foundationArea   = groundBuildArea * 0.5;
  const bodyArea         = groundBuildArea * floors;
  const roofArea         = groundBuildArea * 0.5;
  const totalConstructionArea = foundationArea + bodyArea + roofArea;
  const updatedBudgetMillion  = totalConstructionArea * UNIT_COST_MILLION_PER_M2;

  return {
    buildLength,
    groundBuildArea,
    foundationArea,
    bodyArea,
    roofArea,
    totalConstructionArea,
    updatedBudgetMillion,
    estimatedUnitCostMillionPerM2: UNIT_COST_MILLION_PER_M2,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

export function formatBudget(trieu: number): string {
  if (trieu >= 1000) {
    const ty = trieu / 1000;
    return `${ty % 1 === 0 ? ty.toFixed(0) : ty.toFixed(1)} tỷ`;
  }
  return `${Math.round(trieu)} triệu`;
}

/** Alias kept for Step 2.1 usage */
export const formatBudgetLabel = formatBudget;

// ─────────────────────────────────────────────────────────────────────────────
// Input parsing / validation helpers
// ─────────────────────────────────────────────────────────────────────────────

export function parseSetbackInput(raw: string): number | null {
  const clean = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
  const val   = parseFloat(clean);
  if (isNaN(val) || val < 0) return null;
  return val;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout / grid utilities (used by future AI layout step)
// ─────────────────────────────────────────────────────────────────────────────

export function calcFloorAreaRatio(totalUsableFloorArea: number, siteArea: number): number {
  if (!siteArea) return 0;
  return totalUsableFloorArea / siteArea;
}

export function calcConstructionCoverage(groundFloorArea: number, siteArea: number): number {
  if (!siteArea) return 0;
  return (groundFloorArea / siteArea) * 100;
}

export function snap(value: number, gridStep: number): number {
  return Math.round(value / gridStep) * gridStep;
}

export function hasOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    a.x < b.x + b.width  &&
    a.x + a.width  > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function isInsideBoundary(
  room: { x: number; y: number; width: number; height: number },
  boundary: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  return (
    room.x >= boundary.minX &&
    room.y >= boundary.minY &&
    room.x + room.width  <= boundary.maxX &&
    room.y + room.height <= boundary.maxY
  );
}
