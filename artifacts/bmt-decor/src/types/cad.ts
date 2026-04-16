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
