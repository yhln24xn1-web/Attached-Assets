import { Router } from "express";

const router = Router();

interface Project {
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
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Biệt thự Ecopark Hưng Yên",
    client: "Nguyễn Văn Minh",
    progress: 72,
    step: 5,
    width: 12,
    length: 20,
    floors: 3,
    bedrooms: 5,
    budget: 4200000000,
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: 2,
    title: "Căn hộ Vinhomes Grand Park",
    client: "Trần Thị Lan",
    progress: 43,
    step: 3,
    width: 8,
    length: 14,
    floors: 1,
    bedrooms: 3,
    budget: 1800000000,
    createdAt: "2024-02-20T09:30:00Z",
  },
  {
    id: 3,
    title: "Nhà phố Thảo Điền Q2",
    client: "Lê Hoàng Nam",
    progress: 15,
    step: 2,
    width: 6,
    length: 18,
    floors: 4,
    bedrooms: 6,
    budget: 3500000000,
    createdAt: "2024-03-05T10:00:00Z",
  },
  {
    id: 4,
    title: "Villa Bảo Lộc Lâm Đồng",
    client: "Phạm Thu Hà",
    progress: 90,
    step: 6,
    width: 15,
    length: 25,
    floors: 2,
    bedrooms: 4,
    budget: 6500000000,
    createdAt: "2023-11-10T07:00:00Z",
  },
  {
    id: 5,
    title: "Penthouse Landmark 81",
    client: "Đỗ Quang Huy",
    progress: 5,
    step: 1,
    width: 18,
    length: 30,
    floors: 1,
    bedrooms: 4,
    budget: 12000000000,
    createdAt: "2024-04-01T11:00:00Z",
  },
  {
    id: 6,
    title: "Shophouse Aqua City",
    client: "Vũ Thị Mai",
    progress: 100,
    step: 7,
    width: 7,
    length: 20,
    floors: 5,
    bedrooms: 8,
    budget: 5200000000,
    createdAt: "2023-08-22T08:30:00Z",
  },
];

router.get("/", (_req, res) => {
  res.json(PROJECTS);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params["id"]);
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) {
    res.status(404).json({ message: "Dự án không tồn tại" });
    return;
  }
  res.json(project);
});

router.post("/", (req, res) => {
  const body = req.body as Omit<Project, "id" | "createdAt">;
  const newProject: Project = {
    ...body,
    id: PROJECTS.length + 1,
    createdAt: new Date().toISOString(),
  };
  PROJECTS.push(newProject);
  res.status(201).json(newProject);
});

export default router;
