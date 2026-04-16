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
    jobId: number | string;
    projectId: number;
    projectName: string;
    schemaVersion: string;
    generatedAt: string;
  };
  projectInfo: {
    clientName: string;
    floors: number;
    lotWidth: number;
    lotLength: number;
    bedrooms: number;
    bathrooms: number;
    budget?: number;
  };
  floors: Array<{
    floor: number;
    floorName: string;
    rooms: Array<{ name: string; type: string; area: number }>;
  }>;
  dimensions: {
    buildableWidth: number;
    buildableDepth: number;
  };
  roomData: Array<{
    floor: number;
    floorName: string;
    geometry: Array<{
      id: string;
      type: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
      area: number;
    }>;
  }>;
  grid: {
    unit: "m";
    snap: number;
  };
  stairsCore: {
    stairRooms: Array<{ floor: number; roomId: string; x: number; y: number; width: number; height: number }>;
    shaftRooms: Array<{ floor: number; roomId: string; x: number; y: number; width: number; height: number }>;
  };
  cadDescription: string;
  constraints: {
    noRoomOverlap: boolean;
    widthFits: boolean;
    depthFits: boolean;
    stairCoreConsistent: boolean;
    targetSetback?: number | null;
  };
}
