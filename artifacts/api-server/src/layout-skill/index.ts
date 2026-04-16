import type { LayoutSkillInput, LayoutSkillOutput, FinalCleanJson, FinalFloor, FinalRoom } from "./types";
import { getLayoutRuleBundle }          from "./ruleBundle";
import { planRawLayout }                from "./layoutPlanner";
import { normalizeLayout }              from "./layoutNormalizer";
import { generateGeometry }             from "./layoutGeometryBridge";
import { validateLayout, isPassing }    from "./layoutValidator";
import { repairLayout }                 from "./layoutRepair";
import { scoreLayout }                  from "./layoutScorer";

/** Build the final clean JSON from geometry. */
function buildFinalCleanJson(
  geom:  import("./types").GeomLayout,
  jobId: number,
): FinalCleanJson {
  const floors: FinalFloor[] = geom.floors.map((gf) => {
    const rooms: FinalRoom[] = gf.rooms
      .filter((r) => r.type !== "corridor") // corridor is structural, not displayed
      .map((r) => ({
        name: r.name,
        type: r.type,
        area: r.area,
      }));

    return {
      floor:     gf.floor,
      floorName: gf.floorName,
      rooms,
      geometry:  gf.rooms,
    };
  });

  return {
    jobId,
    buildableWidth: geom.buildableWidth,
    buildableDepth: geom.buildableDepth,
    floors,
  };
}

/**
 * Run the full layout generation pipeline.
 *
 * Steps:
 * A. Build rule bundle
 * B. Plan raw layout (template-based)
 * C. Normalize layout
 * D. Generate geometry
 * E. Validate
 * F. Repair if needed
 * G. Re-validate after repair
 * H. Score
 * I. Build final clean JSON (only if passing)
 */
export async function runLayoutSkill(
  input: LayoutSkillInput,
): Promise<LayoutSkillOutput> {
  // A. Rule bundle
  const bundle = getLayoutRuleBundle();

  // B. Raw plan
  const rawLayout = planRawLayout(input, bundle);

  // C. Normalize
  const normalizedLayout = normalizeLayout(rawLayout, input);

  // D. Geometry
  let geom = generateGeometry(normalizedLayout);

  // E. Validate (first pass)
  let validation = validateLayout(geom, input);

  // F. Repair if needed
  if (!isPassing(validation)) {
    geom       = repairLayout(geom, validation);
    // G. Re-validate after repair
    validation = validateLayout(geom, input);
  }

  // H. Score
  const score = scoreLayout(geom, input, validation);

  // I. Final clean JSON
  const passed          = isPassing(validation);
  const finalCleanJson  = passed
    ? buildFinalCleanJson(geom, input.metadata.jobId)
    : null;

  return {
    rawLayout,
    normalizedLayout,
    geometry: geom,
    validation,
    finalCleanJson,
    score,
    passed,
  };
}

export type { LayoutSkillInput, LayoutSkillOutput } from "./types";
export { buildLayoutInput }                         from "./layoutInputBuilder";
export type { RawWizardData }                       from "./layoutInputBuilder";
