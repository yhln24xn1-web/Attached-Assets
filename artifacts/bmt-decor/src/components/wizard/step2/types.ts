export type SetbackMode = "none" | "front" | "rear" | "total";

export type ChatStage =
  | "ask_setback_mode"
  | "ask_setback_value"
  | "calculating"
  | "confirm_budget"
  | "followup_requirements"
  | "completed";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: number;
  chips?: string[];
  isCalculating?: boolean;
}

export interface FollowupAnswers {
  garage?: boolean;
  altarRoom?: boolean;
  office?: boolean;
  skylight?: boolean;
  backYard?: boolean;
}

export interface ExtractedFacts {
  wantsFullBuild: boolean | null;
  setbackMode: SetbackMode | null;
  setback: number | null;
  userAcceptedBudget: boolean | null;
  followupAnswers: FollowupAnswers;
}

export interface TechnicalSummary {
  landWidth: number;
  landLength: number;
  floors: number;
  setback: number;
  buildLength: number;
  groundBuildArea: number;
  foundationArea: number;
  bodyArea: number;
  roofArea: number;
  totalConstructionArea: number;
  estimatedUnitCostMillionPerM2: number;
  updatedBudgetMillion: number;
}

export interface Step2ChatOutput {
  requirementsText: string;
  extractedData: {
    setback: number | null;
    setbackMode: SetbackMode | null;
    buildLength: number;
    groundBuildArea: number;
    foundationArea: number;
    bodyArea: number;
    roofArea: number;
    totalConstructionArea: number;
    updatedBudget: number;
    userAcceptedBudget: boolean | null;
    wantsFullBuild: boolean | null;
  };
  technicalSummary: TechnicalSummary;
  followupAnswers: FollowupAnswers;
}
