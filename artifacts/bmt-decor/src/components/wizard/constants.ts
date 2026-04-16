import type {
  ArchitectureOption,
  CategoryType,
  DocumentType,
  Priority,
  InterpretationMode,
  FileMetadata,
} from "./types";

export const getFloorKey = (floors: number): string => {
  if (floors <= 1) return "1";
  if (floors === 2) return "2";
  if (floors === 3) return "3";
  return "4-5";
};

export const getCategoryFromFloors = (floors: number): CategoryType => {
  const map: Record<number, CategoryType> = {
    1: "1tang",
    2: "2tang",
    3: "3tang",
    4: "4tang",
    5: "5tang",
  };
  return map[floors] ?? "5tang";
};

export const FLOOR_OPTIONS: { label: string; value: number }[] = [
  { label: "1 tầng", value: 1 },
  { label: "2 tầng", value: 2 },
  { label: "3 tầng", value: 3 },
  { label: "4 tầng", value: 4 },
  { label: "5+ tầng", value: 5 },
];

const UNS = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=480&h=280&fit=crop&auto=format&q=78`;

export const architectureOptions: ArchitectureOption[] = [
  { id: "1a", floorKey: "1", name: "Nhà cấp 4 hiện đại",    interiors: ["Modern", "Minimalist", "Scandinavian"],                          imageUrl: UNS("1600596542815-ffad4c1539a9") },
  { id: "1b", floorKey: "1", name: "Nhà cấp 4 mái bằng",    interiors: ["Modern", "Industrial", "Minimalist"],                            imageUrl: UNS("1600047509807-ba8f99d2cdde") },
  { id: "1c", floorKey: "1", name: "Nhà cấp 4 mái thái",    interiors: ["Indochine", "Wabi Sabi", "Tropical"],                            imageUrl: UNS("1568605114967-8130f3a36994") },
  { id: "1d", floorKey: "1", name: "Nhà cấp 4 sân vườn",    interiors: ["Tropical", "Scandinavian", "Wabi Sabi"],                         imageUrl: UNS("1564013799919-ab600027ffc6") },

  { id: "2a", floorKey: "2", name: "Hiện đại mái bằng",     interiors: ["Modern", "Minimalist", "Industrial"],                            imageUrl: UNS("1600585154340-be6161a56a0c") },
  { id: "2b", floorKey: "2", name: "Hiện đại mái lệch",     interiors: ["Modern", "Scandinavian", "Minimalist"],                          imageUrl: UNS("1613977257363-707ba9348227") },
  { id: "2c", floorKey: "2", name: "Phố cổ truyền thống",   interiors: ["Indochine", "Neoclassic", "Wabi Sabi"],                          imageUrl: UNS("1430285561322-7808604715df") },
  { id: "2d", floorKey: "2", name: "Biệt thự sân vườn",     interiors: ["Tropical", "Modern", "Scandinavian"],                            imageUrl: UNS("1580587771525-78b9dba3b914") },

  { id: "3a", floorKey: "3", name: "Hiện đại công nghiệp",  interiors: ["Industrial", "Modern", "Minimalist"],                            imageUrl: UNS("1555636222-cae831e670b3") },
  { id: "3b", floorKey: "3", name: "Tân cổ điển mái ngói",  interiors: ["Neoclassic", "Indochine", "Wabi Sabi"],                          imageUrl: UNS("1566908829550-e6551b00979b") },
  { id: "3c", floorKey: "3", name: "Biệt thự song lập",     interiors: ["Modern", "Scandinavian", "Tropical"],                            imageUrl: UNS("1512917774080-9991f1c4c750") },
  { id: "3d", floorKey: "3", name: "Nhà phố 3 tầng",        interiors: ["Modern", "Minimalist", "Industrial"],                            imageUrl: UNS("1570129477492-45c003edd2be") },

  { id: "4a", floorKey: "4-5", name: "Biệt thự lớn hiện đại",  interiors: ["Modern", "Minimalist", "Scandinavian", "Industrial"],         imageUrl: UNS("1605276374104-dee2a0ed3cd6") },
  { id: "4b", floorKey: "4-5", name: "Nhà phố cao tầng",       interiors: ["Modern", "Industrial", "Minimalist", "Neoclassic", "Luxury Modern", "Indochine"], imageUrl: UNS("1531971589569-0d9370cbe1e5") },
  { id: "4c", floorKey: "4-5", name: "Công trình kết hợp",     interiors: ["Modern", "Industrial", "Neoclassic", "Indochine", "Wabi Sabi"],imageUrl: UNS("1549517045-bc93de075e53") },
  { id: "4d", floorKey: "4-5", name: "Biệt thự tân cổ điển",   interiors: ["Neoclassic", "Indochine", "Wabi Sabi", "Luxury Modern"],      imageUrl: UNS("1600607687939-ce8a6c25118c") },
];

export const BUDGET_SLIDER_MAX = 5000;
export const BUDGET_SLIDER_STEP = 50;
export const BUDGET_SLIDER_MIN = 100;

export const MAX_FILE_SIZE_MB = 200;

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  site_photo: "Ảnh hiện trạng",
  current_plan: "Bản vẽ hiện trạng",
  reference_plan: "Bản vẽ tham khảo",
  cad_file: "File CAD (DWG/DXF)",
  budget_file: "File dự toán",
  video: "Video",
  other: "Khác",
};

export const INTERPRETATION_MODE_LABELS: Record<InterpretationMode, string> = {
  reference_only: "Chỉ tham khảo",
  layout_source: "Nguồn layout",
  strict_source: "Nguồn chính xác",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  strict: "Bắt buộc",
};

const DEFAULT_INTERPRETATION: Record<DocumentType, InterpretationMode> = {
  site_photo: "reference_only",
  current_plan: "layout_source",
  reference_plan: "reference_only",
  cad_file: "layout_source",
  budget_file: "reference_only",
  video: "reference_only",
  other: "reference_only",
};

export function getDefaultMetadata(documentType: DocumentType): FileMetadata {
  return {
    documentType,
    appliesToFloors: "all",
    priority: "medium",
    interpretationMode: DEFAULT_INTERPRETATION[documentType],
    note: "",
  };
}
