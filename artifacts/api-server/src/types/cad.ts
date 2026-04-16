export type Step3CadStatus =
  | "idle"
  | "generating_json"
  | "sending_to_admin"
  | "pending_admin_cad"
  | "receiving_admin_cad"
  | "completed"
  | "failed";

export interface CadDrawingItem {
  id: string;
  floor?: number;
  floorName?: string;
  imageUrl: string;
  telegramFileId?: string;
  telegramMessageId?: number;
  caption?: string;
  createdAt: string;
}

export interface CadResult {
  status: Step3CadStatus;
  jsonSchemaUrl?: string;
  telegramRequestMessageId?: number;
  sentToAdminAt?: string;
  receivedFromAdminAt?: string;
  cadDrawings: CadDrawingItem[];
}

export interface CadSchema {
  metadata: {
    jobId: number;
    projectId: number;
    projectName: string;
    createdAt: string;
  };
  projectInfo: {
    lotWidth: number;
    lotLength: number;
    floors: number;
    bedrooms: number;
    budget?: number;
  };
  floors: Array<{
    floor: number;
    floorName: string;
    rooms: Array<{ name: string; type: string; area: number }>;
    geometry: Array<{
      id: string;
      type: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
      area: number;
      isFixed?: boolean;
    }>;
  }>;
  dimensions: {
    buildableWidth: number;
    buildableDepth: number;
  };
  roomData: Array<{
    floor: number;
    floorName: string;
    name: string;
    type: string;
    area: number;
  }>;
  grid: {
    unit: "m";
    xLines: number[];
    yLines: number[];
  };
  stairsCore: Array<{
    floor: number;
    items: Array<{
      id: string;
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  }>;
  cadDescription: string;
  constraints: {
    setback?: number | null;
    buildLength?: number | null;
    groundBuildArea?: number | null;
    totalConstructionArea?: number | null;
    updatedBudget?: number | null;
  };
}
