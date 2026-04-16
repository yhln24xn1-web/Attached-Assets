import type { ArchitectureOption, CategoryType } from "./types";

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

export const architectureOptions: ArchitectureOption[] = [
  { id: "1a", floorKey: "1", name: "Nhà cấp 4 hiện đại", interiors: ["Modern", "Minimalist", "Scandinavian"] },
  { id: "1b", floorKey: "1", name: "Nhà cấp 4 mái bằng", interiors: ["Modern", "Industrial", "Minimalist"] },
  { id: "1c", floorKey: "1", name: "Nhà cấp 4 mái thái", interiors: ["Indochine", "Wabi Sabi", "Tropical"] },
  { id: "1d", floorKey: "1", name: "Nhà cấp 4 sân vườn", interiors: ["Tropical", "Scandinavian", "Wabi Sabi"] },

  { id: "2a", floorKey: "2", name: "Hiện đại mái bằng", interiors: ["Modern", "Minimalist", "Industrial"] },
  { id: "2b", floorKey: "2", name: "Hiện đại mái lệch", interiors: ["Modern", "Scandinavian", "Minimalist"] },
  { id: "2c", floorKey: "2", name: "Phố cổ truyền thống", interiors: ["Indochine", "Neoclassic", "Wabi Sabi"] },
  { id: "2d", floorKey: "2", name: "Biệt thự sân vườn", interiors: ["Tropical", "Modern", "Scandinavian"] },

  { id: "3a", floorKey: "3", name: "Hiện đại công nghiệp", interiors: ["Industrial", "Modern", "Minimalist"] },
  { id: "3b", floorKey: "3", name: "Tân cổ điển mái ngói", interiors: ["Neoclassic", "Indochine", "Wabi Sabi"] },
  { id: "3c", floorKey: "3", name: "Biệt thự song lập", interiors: ["Modern", "Scandinavian", "Tropical"] },
  { id: "3d", floorKey: "3", name: "Nhà phố 3 tầng", interiors: ["Modern", "Minimalist", "Industrial"] },

  { id: "4a", floorKey: "4-5", name: "Biệt thự lớn hiện đại", interiors: ["Modern", "Minimalist", "Scandinavian", "Industrial"] },
  { id: "4b", floorKey: "4-5", name: "Nhà phố cao tầng", interiors: ["Modern", "Industrial", "Minimalist", "Neoclassic", "Luxury Modern", "Indochine"] },
  { id: "4c", floorKey: "4-5", name: "Công trình kết hợp", interiors: ["Modern", "Industrial", "Neoclassic", "Indochine", "Wabi Sabi"] },
  { id: "4d", floorKey: "4-5", name: "Biệt thự tân cổ điển", interiors: ["Neoclassic", "Indochine", "Wabi Sabi", "Luxury Modern"] },
];

export const BUDGET_SLIDER_MAX = 5000;
export const BUDGET_SLIDER_STEP = 50;
export const BUDGET_SLIDER_MIN = 100;
