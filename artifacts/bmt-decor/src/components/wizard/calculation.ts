export interface SiteCalcInput {
  lotWidth: number;
  lotLength: number;
  floors: number;
}

export interface SiteCalcResult {
  dienTichDat: number;
  dienTichSan: number;
  heSoMong: number;
  heSoMai: number;
  tongDienTich: number;
  nganSachTrieu: number;
}

const UNIT_PRICE_PER_M2 = 6_000_000;

export function calcSite(input: SiteCalcInput): SiteCalcResult {
  const { lotWidth, lotLength, floors } = input;

  const w = Number(lotWidth) || 0;
  const l = Number(lotLength) || 0;
  const f = Number(floors) || 0;

  const dienTichDat = w * l;
  const dienTichSan = dienTichDat;
  const heSoMong = dienTichSan * 0.5;
  const heSoMai = dienTichSan * 0.5;
  const tongDienTich = heSoMong + dienTichSan * f + heSoMai;
  const nganSachTrieu = Math.round((tongDienTich * UNIT_PRICE_PER_M2) / 1_000_000);

  return { dienTichDat, dienTichSan, heSoMong, heSoMai, tongDienTich, nganSachTrieu };
}

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
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
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
    room.x + room.width <= boundary.maxX &&
    room.y + room.height <= boundary.maxY
  );
}

export function formatBudget(trieu: number): string {
  if (trieu >= 1000) {
    const ty = trieu / 1000;
    return `${ty % 1 === 0 ? ty.toFixed(0) : ty.toFixed(1)} tỷ`;
  }
  return `${trieu} triệu`;
}
