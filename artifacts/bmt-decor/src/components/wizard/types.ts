// ── Primitives ────────────────────────────────────────────────────────────────

export type FloorCount    = 1 | 2 | 3 | 4 | 5;
export type CategoryType  = "1tang" | "2tang" | "3tang" | "4tang" | "5tang";

// ── Step 1.1 — Basic Info ─────────────────────────────────────────────────────

export interface BasicInfoFormValues {
  projectName: string;
  lotWidth:    number;
  lotLength:   number;
  floors:      FloorCount;
  bedrooms:    number;
  bathrooms:   number;
  budget:      number;
}

// ── Step 1.2 — Architecture ───────────────────────────────────────────────────

export interface ArchitectureFormValues {
  architectureId:   string;
  architectureName: string;
  category:         CategoryType;
  style:            string;
}

export interface ArchitectureOption {
  id:        string;
  floorKey:  string;
  name:      string;
  interiors: string[];
  imageUrl:  string;
}

// ── Step 1.3 — References / Documents ────────────────────────────────────────

export type DocumentType =
  | "site_photo"
  | "current_plan"
  | "reference_plan"
  | "cad_file"
  | "budget_file"
  | "video"
  | "other";

export type Priority            = "low" | "medium" | "high" | "strict";
export type InterpretationMode  = "reference_only" | "layout_source" | "strict_source";
export type UploadStatus        = "idle" | "uploading" | "success" | "error";

export interface FileMetadata {
  documentType:       DocumentType;
  appliesToFloors:    number[] | "all";
  priority:           Priority;
  interpretationMode: InterpretationMode;
  note:               string;
}

export interface UploadedFile {
  id:       string;
  file:     File;
  name:     string;
  mimeType: string;
  size:     number;
  preview?: string;
  url?:     string;
  status:   UploadStatus;
  progress: number;
  error?:   string;
  metadata: FileMetadata;
}

export interface ReferencesFormValues {
  files:    UploadedFile[];
  sheetUrl: string;
}

// ── Step 2.1 — Chat Requirements ─────────────────────────────────────────────

export type SetbackMode = "none" | "front" | "rear" | "total";

export type ChatStage =
  | "ask_setback_mode"
  | "ask_setback_value"
  | "calculating"
  | "confirm_budget"
  | "followup_requirements"
  | "completed";

export interface ChatMessage {
  id:              string;
  role:            "assistant" | "user";
  content:         string;
  timestamp:       number;
  chips?:          string[];
  isCalculating?:  boolean;
}

export interface FollowupAnswers {
  garage?:    boolean;
  altarRoom?: boolean;
  office?:    boolean;
  skylight?:  boolean;
  backYard?:  boolean;
}

export interface ExtractedFacts {
  wantsFullBuild:    boolean | null;
  setbackMode:       SetbackMode | null;
  setback:           number | null;
  userAcceptedBudget: boolean | null;
  followupAnswers:   FollowupAnswers;
}

export interface TechnicalSummary {
  landWidth:                   number;
  landLength:                  number;
  floors:                      number;
  setback:                     number;
  buildLength:                 number;
  groundBuildArea:             number;
  foundationArea:              number;
  bodyArea:                    number;
  roofArea:                    number;
  totalConstructionArea:       number;
  estimatedUnitCostMillionPerM2: number;
  updatedBudgetMillion:        number;
}

export interface Step2ChatOutput {
  requirementsText: string;
  extractedData: {
    setback:               number | null;
    setbackMode:           SetbackMode | null;
    buildLength:           number;
    groundBuildArea:       number;
    foundationArea:        number;
    bodyArea:              number;
    roofArea:              number;
    totalConstructionArea: number;
    updatedBudget:         number;
    userAcceptedBudget:    boolean | null;
    wantsFullBuild:        boolean | null;
  };
  technicalSummary:  TechnicalSummary;
  followupAnswers:   FollowupAnswers;
}

// ── Wizard aggregate ──────────────────────────────────────────────────────────

export interface WizardData {
  basicInfo:        BasicInfoFormValues | null;
  architecture:     ArchitectureFormValues | null;
  references:       ReferencesFormValues | null;
  chatRequirements: Step2ChatOutput | null;
}
