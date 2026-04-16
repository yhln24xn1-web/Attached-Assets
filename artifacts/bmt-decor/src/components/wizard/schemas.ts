import { z } from "zod";

export const GOOGLE_SHEET_REGEX =
  /^https:\/\/(docs\.google\.com\/spreadsheets|sheets\.google\.com)/;

export function validateSheetUrl(url: string): boolean {
  if (!url.trim()) return true;
  return GOOGLE_SHEET_REGEX.test(url);
}

// ── Step 1.1 ─────────────────────────────────────────────────────────────────

export const basicInfoSchema = z.object({
  projectName: z
    .string()
    .min(3, "Tên dự án tối thiểu 3 ký tự")
    .max(100, "Tên dự án tối đa 100 ký tự"),
  lotWidth: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .min(3, "Chiều rộng tối thiểu 3m")
    .max(20, "Chiều rộng tối đa 20m"),
  lotLength: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .min(5, "Chiều dài tối thiểu 5m")
    .max(60, "Chiều dài tối đa 60m"),
  floors: z.coerce
    .number()
    .int()
    .min(1, "Vui lòng chọn số tầng")
    .max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  bedrooms: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .int()
    .min(0, "Số phòng ngủ không âm")
    .max(20, "Tối đa 20 phòng ngủ"),
  bathrooms: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .int()
    .min(1, "Tối thiểu 1 phòng tắm")
    .max(20, "Tối đa 20 phòng tắm"),
  budget: z.coerce
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .min(100, "Ngân sách tối thiểu 100 triệu")
    .max(50000, "Ngân sách tối đa 50,000 triệu"),
});

// ── Step 1.2 ─────────────────────────────────────────────────────────────────

export const architectureSchema = z.object({
  architectureId: z.string().min(1, "Vui lòng chọn mẫu kiến trúc"),
  architectureName: z.string().min(1),
  category: z.enum(["1tang", "2tang", "3tang", "4tang", "5tang"]),
  style: z.string().min(1, "Vui lòng chọn phong cách nội thất"),
});

// ── Step 1.3 ─────────────────────────────────────────────────────────────────

export const fileMetadataSchema = z.object({
  documentType: z.enum([
    "site_photo",
    "current_plan",
    "reference_plan",
    "cad_file",
    "budget_file",
    "video",
    "other",
  ]),
  appliesToFloors: z.union([z.array(z.number().int().min(1).max(10)), z.literal("all")]),
  priority: z.enum(["low", "medium", "high", "strict"]),
  interpretationMode: z.enum(["reference_only", "layout_source", "strict_source"]),
  note: z.string().max(500),
});

export const referencesSchema = z.object({
  files: z.array(z.any()),
  sheetUrl: z.string().refine(
    (url) => !url.trim() || GOOGLE_SHEET_REGEX.test(url),
    "URL phải là Google Sheet hợp lệ"
  ),
});

// ── Step 2.1 ─────────────────────────────────────────────────────────────────

export const setbackModeSchema = z.enum(["none", "front", "rear", "total"]);

export const chatRequirementsExtractedSchema = z.object({
  setback: z.number().min(0, "Khoảng chừa không âm").nullable(),
  setbackMode: setbackModeSchema.nullable(),
  buildLength: z.number().positive("Chiều dài xây dựng phải > 0"),
  groundBuildArea: z.number().positive(),
  foundationArea: z.number().positive(),
  bodyArea: z.number().positive(),
  roofArea: z.number().positive(),
  totalConstructionArea: z.number().positive(),
  updatedBudget: z.number().positive(),
  userAcceptedBudget: z.boolean().nullable(),
  wantsFullBuild: z.boolean().nullable(),
});

export const technicalSummarySchema = z.object({
  landWidth: z.number().positive(),
  landLength: z.number().positive(),
  floors: z.number().int().min(1).max(5),
  setback: z.number().min(0),
  buildLength: z.number().positive(),
  groundBuildArea: z.number().positive(),
  foundationArea: z.number().positive(),
  bodyArea: z.number().positive(),
  roofArea: z.number().positive(),
  totalConstructionArea: z.number().positive(),
  estimatedUnitCostMillionPerM2: z.number().positive(),
  updatedBudgetMillion: z.number().positive(),
});

export const followupAnswersSchema = z.object({
  garage: z.boolean().optional(),
  altarRoom: z.boolean().optional(),
  office: z.boolean().optional(),
  skylight: z.boolean().optional(),
  backYard: z.boolean().optional(),
});

export const step2ChatOutputSchema = z.object({
  requirementsText: z.string().min(1),
  extractedData: chatRequirementsExtractedSchema,
  technicalSummary: technicalSummarySchema,
  followupAnswers: followupAnswersSchema,
});

// ── Inferred types (single source of truth) ──────────────────────────────────

export type BasicInfoInput         = z.infer<typeof basicInfoSchema>;
export type ArchitectureInput      = z.infer<typeof architectureSchema>;
export type FileMetadataInput      = z.infer<typeof fileMetadataSchema>;
export type ReferencesInput        = z.infer<typeof referencesSchema>;
export type SetbackMode            = z.infer<typeof setbackModeSchema>;
export type FollowupAnswersInput   = z.infer<typeof followupAnswersSchema>;
export type TechnicalSummaryInput  = z.infer<typeof technicalSummarySchema>;
export type Step2ChatOutputInput   = z.infer<typeof step2ChatOutputSchema>;
