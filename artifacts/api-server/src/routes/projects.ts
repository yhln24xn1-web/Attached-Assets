import fs from "fs";
import { Router, type Request } from "express";
import { getSession } from "../lib/session";
import { runLayoutSkill, buildLayoutInput } from "../layout-skill/index";
import { buildCadSchema } from "../services/cadSchemaBuilder";
import { resolveCadProjectFilePath, saveCadSchemaFile } from "../services/cadStorageService";
import { sendCadSchemaToAdmin } from "../services/cadTelegramService";
import {
  createInitialCadResult,
  saveCadPendingState,
  updateCadStatus,
} from "../services/cadStatusService";
import type { Project, WizardData } from "../types/project";

const router = Router();

// ── In-memory store ───────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
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
    ownerId: "user-002",
    ownerName: "Nguyễn Văn Minh",
    stepStatuses: { "2": "completed" },
    layoutResult: null,
    cadResult: createInitialCadResult(),
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
    ownerId: "user-003",
    ownerName: "Trần Thị Lan",
    stepStatuses: {},
    layoutResult: null,
    cadResult: createInitialCadResult(),
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
    ownerId: "user-004",
    ownerName: "Lê Hoàng Nam",
    stepStatuses: {},
    layoutResult: null,
    cadResult: createInitialCadResult(),
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
    ownerId: "user-002",
    ownerName: "Nguyễn Văn Minh",
    stepStatuses: { "2": "completed" },
    layoutResult: null,
    cadResult: createInitialCadResult(),
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
    ownerId: "user-003",
    ownerName: "Trần Thị Lan",
    stepStatuses: {},
    layoutResult: null,
    cadResult: createInitialCadResult(),
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
    ownerId: "user-004",
    ownerName: "Lê Hoàng Nam",
    stepStatuses: { "2": "completed" },
    layoutResult: null,
    cadResult: createInitialCadResult(),
  },
];

let nextId = 7;

function getProjectAndAuthorize(req: Request) {
  const user = getSession(req);
  if (!user) {
    return { error: { status: 401, message: "Chưa đăng nhập" } } as const;
  }

  const id = Number(req.params["id"]);
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) {
    return { error: { status: 404, message: "Dự án không tồn tại" } } as const;
  }

  if (user.role !== "admin" && project.ownerId !== user.id) {
    return { error: { status: 403, message: "Không có quyền" } } as const;
  }

  return { user, project } as const;
}

async function ensureLayoutResult(project: Project) {
  if (project.layoutResult) {
    return project.layoutResult;
  }

  project.stepStatuses["2"] = "processing";

  const wd = project.wizardData;
  const bi = wd?.basicInfo;
  const cf = wd?.chatRequirements?.extractedData;
  const fup = wd?.chatRequirements?.followupAnswers;

  const skillInput = buildLayoutInput({
    metadata: {
      jobId: project.id,
      projectName: project.title,
      customerName: project.client,
    },
    projectInfo: {
      lotWidth: bi?.lotWidth ?? project.width,
      lotDepth: bi?.lotLength ?? project.length,
      floors: bi?.floors ?? project.floors,
      bedrooms: bi?.bedrooms ?? project.bedrooms,
      bathrooms: bi?.bathrooms ?? 2,
      budget: bi?.budget,
    },
    architecture: wd?.architecture
      ? { style: wd.architecture.style, category: wd.architecture.category }
      : undefined,
    followupAnswers: fup,
    chatFacts: cf
      ? {
          setback: cf.setback,
          buildLength: cf.buildLength,
          groundBuildArea: cf.groundBuildArea,
          totalConstructionArea: cf.totalConstructionArea,
          updatedBudget: cf.updatedBudget,
          userAcceptedBudget: cf.userAcceptedBudget,
        }
      : undefined,
    references: wd?.references,
  });

  const output = await runLayoutSkill(skillInput);
  if (!output.passed || !output.finalCleanJson) {
    project.stepStatuses["2"] = "failed";
    throw new Error("Lỗi sinh layout");
  }

  project.layoutResult = output.finalCleanJson;
  project.stepStatuses["2"] = "completed";
  return output.finalCleanJson;
}

// ── GET /api/projects ─────────────────────────────────────────────────────────

router.get("/", (req, res) => {
  const user = getSession(req);
  if (!user) {
    res.status(401).json({ message: "Chưa đăng nhập" });
    return;
  }

  const result = user.role === "admin" ? PROJECTS : PROJECTS.filter((p) => p.ownerId === user.id);
  res.json(result);
});

// ── GET /api/projects/:id ─────────────────────────────────────────────────────

router.get("/:id", (req, res) => {
  const lookup = getProjectAndAuthorize(req);
  if (lookup.error) {
    res.status(lookup.error.status).json({ message: lookup.error.message });
    return;
  }

  res.json(lookup.project);
});

// ── GET /api/projects/:id/cad-files/:fileName ────────────────────────────────

router.get("/:id/cad-files/:fileName", (req, res) => {
  const lookup = getProjectAndAuthorize(req);
  if (lookup.error) {
    res.status(lookup.error.status).json({ message: lookup.error.message });
    return;
  }

  const fileName = decodeURIComponent(req.params["fileName"] ?? "");
  const filePath = resolveCadProjectFilePath(lookup.project.id, fileName);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: "Tệp không tồn tại" });
    return;
  }

  res.sendFile(filePath);
});

// ── POST /api/projects ────────────────────────────────────────────────────────

router.post("/", (req, res) => {
  const user = getSession(req);
  if (!user) {
    res.status(401).json({ message: "Chưa đăng nhập" });
    return;
  }

  const body = req.body as Partial<Project & { wizardData: WizardData }>;
  const bi = body.wizardData?.basicInfo;

  const project: Project = {
    id: nextId++,
    title: bi?.projectName ?? body.title ?? "Dự án mới",
    client: user.fullName,
    progress: 0,
    step: 3,
    width: bi?.lotWidth ?? body.width ?? 0,
    length: bi?.lotLength ?? body.length ?? 0,
    floors: bi?.floors ?? body.floors ?? 1,
    bedrooms: bi?.bedrooms ?? body.bedrooms ?? 0,
    budget: bi?.budget ?? body.budget ?? 0,
    createdAt: new Date().toISOString(),
    ownerId: user.id,
    ownerName: user.fullName,
    stepStatuses: {},
    layoutResult: null,
    wizardData: body.wizardData,
    cadResult: createInitialCadResult(),
  };

  PROJECTS.push(project);
  res.status(201).json(project);
});

// ── POST /api/projects/:id/process (legacy step-2 layout) ────────────────────

router.post("/:id/process", async (req, res) => {
  const lookup = getProjectAndAuthorize(req);
  if (lookup.error) {
    res.status(lookup.error.status).json({ message: lookup.error.message });
    return;
  }

  try {
    await ensureLayoutResult(lookup.project);
    res.json({
      status: lookup.project.stepStatuses["2"],
      layoutResult: lookup.project.layoutResult,
    });
  } catch (err) {
    lookup.project.stepStatuses["2"] = "failed";
    res.status(500).json({ message: "Lỗi sinh layout", error: String(err) });
  }
});

// ── POST /api/projects/:id/process-step-3 ─────────────────────────────────────

router.post("/:id/process-step-3", async (req, res) => {
  const lookup = getProjectAndAuthorize(req);
  if (lookup.error) {
    res.status(lookup.error.status).json({ message: lookup.error.message });
    return;
  }

  const project = lookup.project;

  try {
    if (project.cadResult.status === "pending_admin_cad" || project.cadResult.status === "completed") {
      res.json({ ok: true, status: project.cadResult.status });
      return;
    }

    await updateCadStatus(project, "generating_json");
    await ensureLayoutResult(project);

    const cadSchema = await buildCadSchema(String(project.id), project);
    const savedJson = await saveCadSchemaFile(project.id, cadSchema);

    await updateCadStatus(project, "sending_to_admin");

    const telegramRes = await sendCadSchemaToAdmin({
      projectId: String(project.id),
      jobId: cadSchema.metadata.jobId,
      filePath: savedJson.filePath,
      caption: `[CAD JSON] JOB ID: ${cadSchema.metadata.jobId} | ${project.title} | ${project.floors} tầng`,
    });

    await saveCadPendingState(project, {
      status: "pending_admin_cad",
      jsonSchemaUrl: savedJson.url,
      telegramRequestMessageId: telegramRes.telegramMessageId,
      sentToAdminAt: new Date().toISOString(),
    });

    res.json({ ok: true, status: "pending_admin_cad" });
  } catch (error) {
    await updateCadStatus(project, "failed");
    res.status(500).json({ ok: false, message: "Không thể xử lý bản vẽ kỹ thuật", error: String(error) });
  }
});

export default router;
