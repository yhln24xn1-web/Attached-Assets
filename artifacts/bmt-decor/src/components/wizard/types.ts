export type FloorCount = 1 | 2 | 3 | 4 | 5;
export type CategoryType = "1tang" | "2tang" | "3tang" | "4tang" | "5tang";

export interface BasicInfoFormValues {
  projectName: string;
  lotWidth: number;
  lotLength: number;
  floors: FloorCount;
  bedrooms: number;
  bathrooms: number;
  budget: number;
}

export interface ArchitectureFormValues {
  architectureId: string;
  architectureName: string;
  category: CategoryType;
  style: string;
}

export type DocumentType =
  | "site_photo"
  | "current_plan"
  | "reference_plan"
  | "cad_file"
  | "budget_file"
  | "video"
  | "other";

export type Priority = "low" | "medium" | "high" | "strict";
export type InterpretationMode = "reference_only" | "layout_source" | "strict_source";
export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface FileMetadata {
  documentType: DocumentType;
  appliesToFloors: number[] | "all";
  priority: Priority;
  interpretationMode: InterpretationMode;
  note: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  mimeType: string;
  size: number;
  preview?: string;
  url?: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  metadata: FileMetadata;
}

export interface ReferencesFormValues {
  files: UploadedFile[];
  sheetUrl: string;
}

export interface WizardData {
  basicInfo: BasicInfoFormValues | null;
  architecture: ArchitectureFormValues | null;
  references: ReferencesFormValues | null;
}

export interface ArchitectureOption {
  id: string;
  floorKey: string;
  name: string;
  interiors: string[];
}
