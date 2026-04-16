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

export interface WizardData {
  basicInfo: BasicInfoFormValues | null;
  architecture: ArchitectureFormValues | null;
}

export interface ArchitectureOption {
  id: string;
  floorKey: string;
  name: string;
  interiors: string[];
}
