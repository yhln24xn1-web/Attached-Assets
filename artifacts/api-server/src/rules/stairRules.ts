import { STAIR, FLOOR_HEIGHT_M } from "./constants";
import { mToMm } from "./units";
import { fail, pass, type RuleResult } from "./validators";

export interface StairConfig {
  riserMm: number;
  treadMm: number;
  widthM: number;
  stepsPerRun?: number;
  hasLanding?: boolean;
}

export interface StairCalcResult {
  riserMm: number;
  treadMm: number;
  stepCount: number;
  runLengthM: number;
  totalHeightM: number;
  landingWidthM: number;
  overallLengthM: number;
}

export function calcStair(
  config: StairConfig,
  floorHeightM: number = FLOOR_HEIGHT_M
): StairCalcResult {
  const floorHeightMm = mToMm(floorHeightM);
  const stepCount = Math.round(floorHeightMm / config.riserMm);
  const stepsPerRun = config.stepsPerRun ?? Math.ceil(stepCount / 2);
  const runLengthM = (stepsPerRun * config.treadMm) / 1000;
  const landingWidthM = config.hasLanding !== false ? STAIR.LANDING_WIDTH_M : 0;
  const overallLengthM = runLengthM * 2 + landingWidthM;

  return {
    riserMm: config.riserMm,
    treadMm: config.treadMm,
    stepCount,
    runLengthM: Math.round(runLengthM * 100) / 100,
    totalHeightM: floorHeightM,
    landingWidthM,
    overallLengthM: Math.round(overallLengthM * 100) / 100,
  };
}

export function validateStairRiser(riserMm: number): RuleResult {
  if (riserMm < STAIR.MIN_RISER_MM || riserMm > STAIR.MAX_RISER_MM) {
    return fail(
      "validateStairRiser",
      `Bậc đứng ${riserMm}mm ngoài phạm vi [${STAIR.MIN_RISER_MM}–${STAIR.MAX_RISER_MM}]mm`
    );
  }
  return pass("validateStairRiser");
}

export function validateStairTread(treadMm: number): RuleResult {
  if (treadMm < STAIR.MIN_TREAD_MM || treadMm > STAIR.MAX_TREAD_MM) {
    return fail(
      "validateStairTread",
      `Bậc ngang ${treadMm}mm ngoài phạm vi [${STAIR.MIN_TREAD_MM}–${STAIR.MAX_TREAD_MM}]mm`
    );
  }
  return pass("validateStairTread");
}

export function validateStairWidth(widthM: number): RuleResult {
  if (widthM < STAIR.MIN_WIDTH_M) {
    return fail(
      "validateStairWidth",
      `Chiều rộng cầu thang ${widthM}m nhỏ hơn tối thiểu ${STAIR.MIN_WIDTH_M}m`
    );
  }
  return pass("validateStairWidth");
}

export function validateStairComfortFormula(riserMm: number, treadMm: number): RuleResult {
  const sum = 2 * riserMm + treadMm;
  if (sum < 600 || sum > 640) {
    return fail(
      "validateStairComfortFormula",
      `2×${riserMm} + ${treadMm} = ${sum}mm (chuẩn tiện nghi: 600–640mm)`
    );
  }
  return pass("validateStairComfortFormula");
}

export function validateStairConfig(config: StairConfig): RuleResult[] {
  return [
    validateStairRiser(config.riserMm),
    validateStairTread(config.treadMm),
    validateStairWidth(config.widthM),
    validateStairComfortFormula(config.riserMm, config.treadMm),
  ];
}
