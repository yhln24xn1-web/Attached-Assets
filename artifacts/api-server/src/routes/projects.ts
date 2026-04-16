import { Router } from "express";
import { getSession } from "../lib/session";
import { buildLayoutInput, runLayoutSkill } from "../layout-skill/index";
import type { Project, WizardData } from "../types/project";
import { PROJECTS, getNextProjectId, getProjectById } from "../services/projectStore";
import { buildCadSchema } from "../services/cadSchemaBuilder";
import { saveCadSchemaFile } from "../services/cadStorageService";
import { sendCadSchemaToAdmin } from "../services/cadTelegramService";
import { updateCadStatus } from "../services/cadStatusService";

const router = Router();

router.get("/", (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const result = user.role === "admin"
    ? PROJECTS
    : PROJECTS.filter((p) => p.ownerId === user.id);
  res.json(result);
});

router.get("/:id", (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const id = Number(req.params["id"]);
  const project = getProjectById(id);
  if (!project) { res.status(404).json({ message: "Dự án không tồn tại" }); return; }
  if (user.role !== "admin" && project.ownerId !== user.id) {
    res.status(403).json({ message: "Không có quyền" }); return;
  }
  res.json(project);
});

router.post("/", (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const body = req.body as Partial<Project & { wizardData: WizardData }>;
  const bi = body.wizardData?.basicInfo;

  const project: Project = {
    id: getNextProjectId(),
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
    cadResult: {
      status: "idle",
      cadDrawings: [],
    },
    wizardData: body.wizardData,
  };

  PROJECTS.push(project);
  res.status(201).json(project);
});

router.post("/:id/process", async (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const id = Number(req.params["id"]);
  const project = getProjectById(id);
  if (!project) { res.status(404).json({ message: "Dự án không tồn tại" }); return; }
  if (user.role !== "admin" && project.ownerId !== user.id) {
    res.status(403).json({ message: "Không có quyền" }); return;
  }

  project.stepStatuses["2"] = "processing";

  try {
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
      chatFacts: cf ? {
        setback: cf.setback,
        buildLength: cf.buildLength,
        groundBuildArea: cf.groundBuildArea,
        totalConstructionArea: cf.totalConstructionArea,
        updatedBudget: cf.updatedBudget,
        userAcceptedBudget: cf.userAcceptedBudget,
      } : undefined,
      references: wd?.references,
    });

    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    const output = await runLayoutSkill(skillInput);

    if (output.passed && output.finalCleanJson) {
      project.layoutResult = output.finalCleanJson;
      project.stepStatuses["2"] = "completed";
      project.progress = 60;
    } else {
      project.stepStatuses["2"] = "failed";
    }

    res.json({
      status: project.stepStatuses["2"],
      layoutResult: project.layoutResult,
      score: output.score,
      issues: output.validation.issues,
    });
  } catch (err) {
    project.stepStatuses["2"] = "failed";
    res.status(500).json({ message: "Lỗi sinh layout", error: String(err) });
  }
});

router.post("/:id/process-step-3", async (req, res) => {
  const user = getSession(req);
  if (!user) { res.status(401).json({ message: "Chưa đăng nhập" }); return; }

  const id = Number(req.params["id"]);
  const project = getProjectById(id);
  if (!project) { res.status(404).json({ message: "Dự án không tồn tại" }); return; }
  if (user.role !== "admin" && project.ownerId !== user.id) {
    res.status(403).json({ message: "Không có quyền" }); return;
  }

  const projectId = String(id);

  try {
    await updateCadStatus(projectId, "generating_json");

    const cadSchema = await buildCadSchema(projectId);
    const savedJson = await saveCadSchemaFile(projectId, cadSchema);

    await updateCadStatus(projectId, "sending_to_admin");

    const telegramRes = await sendCadSchemaToAdmin({
      projectId,
      jobId: cadSchema.metadata.jobId,
      filePath: savedJson.filePath,
      caption: `[CAD] JOB ID: ${cadSchema.metadata.jobId} | ${cadSchema.metadata.projectName}`,
    });

    await updateCadStatus(projectId, "pending_admin_cad", {
      jsonSchemaUrl: savedJson.url,
      telegramRequestMessageId: telegramRes.telegramMessageId,
      sentToAdminAt: new Date().toISOString(),
    });

    res.json({
      ok: true,
      status: "pending_admin_cad",
    });
  } catch (err) {
    await updateCadStatus(projectId, "failed");
    res.status(500).json({ ok: false, status: "failed", error: String(err) });
  }
});

export default router;
