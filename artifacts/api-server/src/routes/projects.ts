import { Router } from "express";
import { getSession } from "../lib/session";
import { runLayoutSkill, buildLayoutInput } from "../layout-skill/index";
import type { FinalCleanJson } from "../layout-skill/types";

const router = Router();

// ── Project model ──────────────────────────────────────────────────────────────

interface WizardData {
  basicInfo?: {
    projectName: string;
    lotWidth:    number;
    lotLength:   number;
    floors:      number;
    bedrooms:    number;
    bathrooms:   number;
    budget:      number;
  };
  architecture?: {
    architectureName: string;
    style:            string;
    category:         string;
  };
  references?: Array<{
    id:                string;
    name:              string;
    type:              string;
    priority:          string;
    interpretationMode: string;
    appliesToFloors:   number[] | "all";
    url:               string;
    note?:             string;
  }>;
  chatRequirements?: {
    extractedData: {
      setback?:              number | null;
      buildLength?:          number | null;
      groundBuildArea?:      number | null;
      totalConstructionArea?: number | null;
      updatedBudget?:        number | null;
      userAcceptedBudget?:   boolean | null;
    };
    followupAnswers?: {
      garage?:    boolean;
      altarRoom?: boolean;
      office?:    boolean;
      skylight?:  boolean;
      backYard?:  boolean;
    };
  };
}

type ProcessStatus = "pending" | "processing" | "completed" | "failed";

interface Project {
  id:            number;
  title:         string;
  client:        string;
  progress:      number;
  step:          number;
  width:         number;
  length:        number;
  floors:        number;
  bedrooms:      number;
  budget:        number;
  createdAt:     string;
  ownerId:       string;
  ownerName:     string;
  stepStatuses:  Record<string, ProcessStatus>;
  layoutResult:  FinalCleanJson | null;
  wizardData?:   WizardData;
}

// ── In-memory store ───────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: 1, title: "Biệt thự Ecopark Hưng Yên", client: "Nguyễn Văn Minh",
    progress: 72, step: 5, width: 12, length: 20, floors: 3, bedrooms: 5,
    budget: 4200000000, createdAt: "2024-01-15T08:00:00Z",
    ownerId: "user-002", ownerName: "Nguyễn Văn Minh",
    stepStatuses: { "2": "completed" }, layoutResult: null,
  },
  {
    id: 2, title: "Căn hộ Vinhomes Grand Park", client: "Trần Thị Lan",
    progress: 43, step: 3, width: 8, length: 14, floors: 1, bedrooms: 3,
    budget: 1800000000, createdAt: "2024-02-20T09:30:00Z",
    ownerId: "user-003", ownerName: "Trần Thị Lan",
    stepStatuses: {}, layoutResult: null,
  },
  {
    id: 3, title: "Nhà phố Thảo Điền Q2", client: "Lê Hoàng Nam",
    progress: 15, step: 2, width: 6, length: 18, floors: 4, bedrooms: 6,
    budget: 3500000000, createdAt: "2024-03-05T10:00:00Z",
    ownerId: "user-004", ownerName: "Lê Hoàng Nam",
    stepStatuses: {}, layoutResult: null,
  },
  {
    id: 4, title: "Villa Bảo Lộc Lâm Đồng", client: "Phạm Thu Hà",
    progress: 90, step: 6, width: 15, length: 25, floors: 2, bedrooms: 4,
    budget: 6500000000, createdAt: "2023-11-10T07:00:00Z",
    ownerId: "user-002", ownerName: "Nguyễn Văn Minh",
    stepStatuses: { "2": "completed" }, layoutResult: null,
  },
  {
    id: 5, title: "Penthouse Landmark 81", client: "Đỗ Quang Huy",
    progress: 5, step: 1, width: 18, length: 30, floors: 1, bedrooms: 4,
    budget: 12000000000, createdAt: "2024-04-01T11:00:00Z",
    ownerId: "user-003", ownerName: "Trần Thị Lan",
    stepStatuses: {}, layoutResult: null,
  },
  {
    id: 6, title: "Shophouse Aqua City", client: "Vũ Thị Mai",
    progress: 100, step: 7, width: 7, length: 20, floors: 5, bedrooms: 8,
    budget: 5200000000, createdAt: "2023-08-22T08:30:00Z",
    ownerId: "user-004", ownerName: "Lê Hoàng Nam",
    stepStatuses: { "2": "completed" }, layoutResult: null,
  },
];

let nextId = 7;

// ── GET /api/projects ─────────────────────────────────────────────────────────

router.get("/", (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const result = user.role === "admin"
    ? PROJECTS
    : PROJECTS.filter((p) => p.ownerId === user.id);
  res.json(result);
});

// ── GET /api/projects/:id ─────────────────────────────────────────────────────

router.get("/:id", (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const id      = Number(req.params["id"]);
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) { res.status(404).json({ message: "Dự án không tồn tại" }); return; }
  if (user.role !== "admin" && project.ownerId !== user.id) {
    res.status(403).json({ message: "Không có quyền" }); return;
  }
  res.json(project);
});

// ── POST /api/projects ────────────────────────────────────────────────────────

router.post("/", (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const body = req.body as Partial<Project & { wizardData: WizardData }>;
  const bi   = body.wizardData?.basicInfo;

  const project: Project = {
    id:           nextId++,
    title:        bi?.projectName ?? body.title ?? "Dự án mới",
    client:       user.fullName,
    progress:     0,
    step:         3,
    width:        bi?.lotWidth   ?? body.width  ?? 0,
    length:       bi?.lotLength  ?? body.length ?? 0,
    floors:       bi?.floors     ?? body.floors ?? 1,
    bedrooms:     bi?.bedrooms   ?? body.bedrooms ?? 0,
    budget:       bi?.budget     ?? body.budget ?? 0,
    createdAt:    new Date().toISOString(),
    ownerId:      user.id,
    ownerName:    user.fullName,
    stepStatuses: {},
    layoutResult: null,
    wizardData:   body.wizardData,
  };

  PROJECTS.push(project);
  res.status(201).json(project);
});

// ── POST /api/projects/:id/process ────────────────────────────────────────────

router.post("/:id/process", async (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const id      = Number(req.params["id"]);
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) { res.status(404).json({ message: "Dự án không tồn tại" }); return; }
  if (user.role !== "admin" && project.ownerId !== user.id) {
    res.status(403).json({ message: "Không có quyền" }); return;
  }

  // Mark as processing immediately
  project.stepStatuses["2"] = "processing";

  try {
    const wd  = project.wizardData;
    const bi  = wd?.basicInfo;
    const cf  = wd?.chatRequirements?.extractedData;
    const fup = wd?.chatRequirements?.followupAnswers;

    const skillInput = buildLayoutInput({
      metadata: {
        jobId:        project.id,
        projectName:  project.title,
        customerName: project.client,
      },
      projectInfo: {
        lotWidth:  bi?.lotWidth   ?? project.width,
        lotDepth:  bi?.lotLength  ?? project.length,
        floors:    bi?.floors     ?? project.floors,
        bedrooms:  bi?.bedrooms   ?? project.bedrooms,
        bathrooms: bi?.bathrooms  ?? 2,
        budget:    bi?.budget,
      },
      architecture: wd?.architecture
        ? { style: wd.architecture.style, category: wd.architecture.category }
        : undefined,
      followupAnswers: fup,
      chatFacts: cf ? {
        setback:               cf.setback,
        buildLength:           cf.buildLength,
        groundBuildArea:       cf.groundBuildArea,
        totalConstructionArea: cf.totalConstructionArea,
        updatedBudget:         cf.updatedBudget,
        userAcceptedBudget:    cf.userAcceptedBudget,
      } : undefined,
      references: wd?.references,
    });

    // Simulate AI processing delay
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    const output = await runLayoutSkill(skillInput);

    if (output.passed && output.finalCleanJson) {
      project.layoutResult    = output.finalCleanJson;
      project.stepStatuses["2"] = "completed";
      project.progress = 60;
    } else {
      project.stepStatuses["2"] = "failed";
    }

    res.json({
      status:       project.stepStatuses["2"],
      layoutResult: project.layoutResult,
      score:        output.score,
      issues:       output.validation.issues,
    });
  } catch (err) {
    project.stepStatuses["2"] = "failed";
    res.status(500).json({ message: "Lỗi sinh layout", error: String(err) });
  }
});

export default router;
