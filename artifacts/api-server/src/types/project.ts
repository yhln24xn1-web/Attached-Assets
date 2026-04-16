import type { FinalCleanJson } from "../layout-skill/types";
import type { CadResult } from "./cad";

export interface WizardData {
  basicInfo?: {
    projectName: string;
    lotWidth: number;
    lotLength: number;
    floors: number;
    bedrooms: number;
    bathrooms: number;
    budget: number;
  };
  architecture?: {
    architectureName: string;
    style: string;
    category: string;
  };
  references?: Array<{
    id: string;
    name: string;
    type: string;
    priority: string;
    interpretationMode: string;
    appliesToFloors: number[] | "all";
    url: string;
    note?: string;
  }>;
  chatRequirements?: {
    extractedData: {
      setback?: number | null;
      buildLength?: number | null;
      groundBuildArea?: number | null;
      totalConstructionArea?: number | null;
      updatedBudget?: number | null;
      userAcceptedBudget?: boolean | null;
    };
    followupAnswers?: {
      garage?: boolean;
      altarRoom?: boolean;
      office?: boolean;
      skylight?: boolean;
      backYard?: boolean;
    };
  };
}

export type ProcessStatus = "pending" | "processing" | "completed" | "failed";

export interface Project {
  id: number;
  title: string;
  client: string;
  progress: number;
  step: number;
  width: number;
  length: number;
  floors: number;
  bedrooms: number;
  budget: number;
  createdAt: string;
  ownerId: string;
  ownerName: string;
  stepStatuses: Record<string, ProcessStatus>;
  layoutResult: FinalCleanJson | null;
  wizardData?: WizardData;
  cadResult: CadResult;
}
