export const UNIT_COST_MILLION_PER_M2 = 6;

export interface CalcResult {
  buildLength: number;
  groundBuildArea: number;
  foundationArea: number;
  bodyArea: number;
  roofArea: number;
  totalConstructionArea: number;
  updatedBudgetMillion: number;
  estimatedUnitCostMillionPerM2: number;
}

export function calcConstruction(
  landWidth: number,
  landLength: number,
  floors: number,
  setback: number
): CalcResult {
  const buildLength = landLength - setback;
  const groundBuildArea = landWidth * buildLength;
  const foundationArea = groundBuildArea * 0.5;
  const bodyArea = groundBuildArea * floors;
  const roofArea = groundBuildArea * 0.5;
  const totalConstructionArea = foundationArea + bodyArea + roofArea;
  const updatedBudgetMillion = totalConstructionArea * UNIT_COST_MILLION_PER_M2;

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

export function formatBudgetLabel(million: number): string {
  if (million >= 1000) {
    const ty = million / 1000;
    return `${ty % 1 === 0 ? ty.toFixed(0) : ty.toFixed(1)} tỷ`;
  }
  return `${Math.round(million)} triệu`;
}

export function parseSetbackInput(raw: string): number | null {
  const clean = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
  const val = parseFloat(clean);
  if (isNaN(val) || val < 0) return null;
  return val;
}
