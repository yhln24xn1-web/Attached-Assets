import type { LayoutSkillInput } from "./types";
import type { LayoutRuleBundle } from "./ruleBundle";

/** Build a human-readable constraint description for the layout. */
export function buildLayoutPrompt(
  input: LayoutSkillInput,
  bundle: LayoutRuleBundle,
): string {
  const { projectInfo: pi, floorDetails, requirements: req } = input;
  const setbacks = bundle.siteRules.calcSiteLayout({
    lotWidth:  pi.lotWidth,
    lotDepth:  pi.lotDepth,
    floors:    pi.floors,
    setbacks: {
      front: req.layoutRules.frontSetback ?? 4.5,
      rear:  req.layoutRules.rearSetback  ?? 2.0,
      left:  req.layoutRules.leftSetback  ?? 0,
      right: req.layoutRules.rightSetback ?? 0,
    },
  });

  const lines: string[] = [
    `=== LAYOUT CONSTRAINTS: ${input.metadata.projectName} ===`,
    "",
    `Kích thước lô đất: ${pi.lotWidth}m × ${pi.lotDepth}m`,
    `Số tầng: ${pi.floors}`,
    `Diện tích xây dựng sau giật lùi: ${setbacks.buildableWidth.toFixed(2)}m × ${setbacks.buildableDepth.toFixed(2)}m`,
    `Mật độ xây dựng: ${setbacks.coveragePct.toFixed(1)}%`,
    "",
    "--- PER-FLOOR REQUIREMENTS ---",
  ];

  for (const fd of floorDetails) {
    const specials = fd.special.length > 0 ? ` | Đặc biệt: ${fd.special.join(", ")}` : "";
    lines.push(`  ${fd.name}: ${fd.bedroom} PN, ${fd.wc} WC${specials}`);
  }

  lines.push("");
  lines.push("--- HARD REQUIREMENTS ---");
  for (const [k, v] of Object.entries(req.hard)) {
    if (v) lines.push(`  ✓ ${k}`);
  }

  lines.push("");
  lines.push("--- LAYOUT RULES ---");
  const lr = req.layoutRules;
  lines.push(`  Cầu thang: ${lr.stairType ?? "l_shape"}`);
  lines.push(`  Fixed stair core: ${lr.fixedStairCore ? "CÓ" : "KHÔNG"}`);
  if (lr.parkingType && lr.parkingType !== "none") {
    lines.push(`  Gara: ${lr.parkingType}`);
  }

  const cf = input.chatFacts;
  if (cf?.setback != null) {
    lines.push(`  Giật lùi thực tế: ${cf.setback}m`);
  }

  if (input.references && input.references.length > 0) {
    lines.push("");
    lines.push("--- REFERENCE FILES ---");
    for (const ref of input.references) {
      lines.push(`  [${ref.priority.toUpperCase()}] ${ref.name} (${ref.type}) — ${ref.interpretationMode}`);
    }
  }

  return lines.join("\n");
}
