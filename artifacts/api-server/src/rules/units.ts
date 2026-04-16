export function mToMm(meters: number): number {
  return meters * 1000;
}

export function mmToM(mm: number): number {
  return mm / 1000;
}

export function mmToM2(widthMm: number, depthMm: number): number {
  return (widthMm / 1000) * (depthMm / 1000);
}

export function trieusToVnd(trieus: number): number {
  return trieus * 1_000_000;
}

export function vndToTrieus(vnd: number): number {
  return vnd / 1_000_000;
}

export function assertMeters(value: number, name: string): void {
  if (value > 1000) {
    throw new Error(
      `[units] "${name}" = ${value} looks like mm, not m. Convert before passing to engine.`
    );
  }
}

export function assertMillimeters(value: number, name: string): void {
  if (value < 1) {
    throw new Error(
      `[units] "${name}" = ${value} looks like m, not mm. Convert before passing to CAD export.`
    );
  }
}

export function snap(value: number, gridStep: number): number {
  return Math.round(value / gridStep) * gridStep;
}
