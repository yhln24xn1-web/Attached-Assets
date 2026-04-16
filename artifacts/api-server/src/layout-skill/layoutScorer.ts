import type { GeomLayout, LayoutSkillInput, LayoutSkillValidation, LayoutScore } from "./types";

/** Score functional correctness of the layout (0–100). */
function scoreFunctionality(
  geom:       GeomLayout,
  input:      LayoutSkillInput,
  validation: LayoutSkillValidation,
): number {
  let score = 100;

  if (!validation.roomCountCorrect) score -= 30;
  if (!validation.wcCountCorrect)   score -= 20;

  // Check ground floor has living room
  const ground = geom.floors.find((f) => f.floor === 0);
  if (ground) {
    const hasLiving  = ground.rooms.some((r) => r.type === "living_room");
    const hasKitchen = ground.rooms.some((r) => r.type === "kitchen");
    if (!hasLiving)  score -= 10;
    if (!hasKitchen) score -= 10;
  }

  // Check upper floors have bedrooms where expected
  for (const detail of input.floorDetails) {
    if (detail.bedroom === 0) continue;
    const gf = geom.floors.find((f) => f.floor === detail.floor);
    if (!gf) { score -= 5; continue; }
    const actualBeds = gf.rooms.filter((r) =>
      r.type === "master_bedroom" || r.type === "bedroom",
    ).length;
    if (actualBeds < detail.bedroom) score -= 5;
  }

  return Math.max(0, score);
}

/** Score geometry quality (overlap-free, fits boundary) (0–100). */
function scoreGeometry(validation: LayoutSkillValidation): number {
  let score = 100;
  if (!validation.noRoomOverlap)  score -= 40;
  if (!validation.noStairOverlap) score -= 20;
  if (!validation.widthFits)      score -= 20;
  if (!validation.depthFits)      score -= 20;
  return Math.max(0, score);
}

/** Score cross-floor consistency (stair core) (0–100). */
function scoreConsistency(validation: LayoutSkillValidation): number {
  return validation.stairCoreConsistent ? 100 : 50;
}

/** Score reference file adherence (0–100).
 *  Without AI parsing, we score proportionally to # of strict_source refs. */
function scoreReferences(input: LayoutSkillInput): number {
  if (!input.references || input.references.length === 0) return 100;

  const strictRefs = input.references.filter(
    (r) => r.interpretationMode === "strict_source",
  );
  // Without AI image parsing, we can't fully honour strict sources
  if (strictRefs.length > 0) return 60;
  return 90;
}

/** Compute overall weighted score. */
export function scoreLayout(
  geom:       GeomLayout,
  input:      LayoutSkillInput,
  validation: LayoutSkillValidation,
): LayoutScore {
  const functionScore    = scoreFunctionality(geom, input, validation);
  const geometryScore    = scoreGeometry(validation);
  const consistencyScore = scoreConsistency(validation);
  const referenceScore   = scoreReferences(input);

  const total = Math.round(
    functionScore    * 0.4 +
    geometryScore    * 0.3 +
    consistencyScore * 0.2 +
    referenceScore   * 0.1,
  );

  return { total, functionScore, geometryScore, consistencyScore, referenceScore };
}
