import type { TechnicalSummary, FollowupAnswers } from "./types";
import { formatBudgetLabel } from "./calculation";

export interface FollowupQuestion {
  key:          keyof FollowupAnswers;
  text:         string;
  chips:        string[];
  positiveChip: string;
}

export const FOLLOWUP_QUESTIONS: FollowupQuestion[] = [
  {
    key:          "garage",
    text:         "Bạn có cần gara xe không?",
    chips:        ["Có, cần gara 🚗", "Không cần"],
    positiveChip: "Có, cần gara 🚗",
  },
  {
    key:          "altarRoom",
    text:         "Gia đình có phòng thờ không?",
    chips:        ["Có phòng thờ 🪔", "Không cần"],
    positiveChip: "Có phòng thờ 🪔",
  },
  {
    key:          "office",
    text:         "Cần phòng làm việc / văn phòng không?",
    chips:        ["Có, cần phòng làm việc 💼", "Không cần"],
    positiveChip: "Có, cần phòng làm việc 💼",
  },
  {
    key:          "skylight",
    text:         "Muốn có giếng trời để lấy sáng tự nhiên không?",
    chips:        ["Có, muốn giếng trời ☀️", "Không cần"],
    positiveChip: "Có, muốn giếng trời ☀️",
  },
  {
    key:          "backYard",
    text:         "Có cần sân sau không?",
    chips:        ["Có, cần sân sau 🌳", "Không cần"],
    positiveChip: "Có, cần sân sau 🌳",
  },
];

export function buildWelcomeMessage(
  landWidth:  number,
  landLength: number,
  floors:     number
): string {
  return (
    `Xin chào! Tôi đã xem qua thông số lô đất của bạn: **${landWidth}×${landLength}m**, ` +
    `${floors} tầng.\n\nĐể tính diện tích xây dựng chính xác, bạn muốn **xây hết đất** hay **chừa sân trước/sau**?`
  );
}

export function buildCalculationMessage(summary: TechnicalSummary): string {
  const budgetLabel = formatBudgetLabel(summary.updatedBudgetMillion);
  const setbackLine =
    summary.setback === 0
      ? "Xây hết đất, không chừa sân."
      : `Chừa **${summary.setback}m** → chiều dài xây dựng thực: **${summary.buildLength.toFixed(1)}m**.`;

  return (
    `${setbackLine}\n\n` +
    `📐 Diện tích sàn 1 tầng: **${summary.groundBuildArea.toFixed(1)}m²**\n` +
    `🏗️ Tổng DTXD (móng + thân + mái): **${summary.totalConstructionArea.toFixed(1)}m²**\n\n` +
    `💰 Ngân sách đề xuất: **${budgetLabel}** _(đơn giá ${summary.estimatedUnitCostMillionPerM2} triệu/m²)_\n\n` +
    `Bạn thấy mức ngân sách này ổn không?`
  );
}

export function buildFollowupIntroMessage(): string {
  return "Tuyệt! Tôi có thêm một vài câu hỏi nhanh để phác thảo không gian cho bạn 👇";
}

export function buildCompletionMessage(followup: FollowupAnswers): string {
  const features: string[] = [];
  if (followup.garage)    features.push("gara xe");
  if (followup.altarRoom) features.push("phòng thờ");
  if (followup.office)    features.push("phòng làm việc");
  if (followup.skylight)  features.push("giếng trời");
  if (followup.backYard)  features.push("sân sau");

  const featureLine =
    features.length > 0
      ? `Tôi đã ghi nhận: **${features.join(", ")}**.\n\n`
      : "";

  return (
    featureLine +
    "✅ Đã có đủ thông tin! Bên dưới là tổng hợp thông số kỹ thuật của dự án. " +
    "Bấm **Hoàn thành** để tiếp tục bước phân tích AI."
  );
}

export function buildRequirementsText(
  summary:  TechnicalSummary,
  followup: FollowupAnswers
): string {
  const lines: string[] = [
    `Lô đất: ${summary.landWidth}×${summary.landLength}m, ${summary.floors} tầng`,
    `Chừa sân: ${summary.setback}m`,
    `Chiều dài xây: ${summary.buildLength.toFixed(1)}m`,
    `Tổng DTXD: ${summary.totalConstructionArea.toFixed(1)}m²`,
    `Ngân sách: ${formatBudgetLabel(summary.updatedBudgetMillion)}`,
    followup.garage    ? "Có gara xe"         : "",
    followup.altarRoom ? "Có phòng thờ"       : "",
    followup.office    ? "Có phòng làm việc"  : "",
    followup.skylight  ? "Có giếng trời"      : "",
    followup.backYard  ? "Có sân sau"         : "",
  ];
  return lines.filter(Boolean).join("; ");
}
