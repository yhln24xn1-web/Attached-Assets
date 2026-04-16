import type { CadDrawingItem, CadResult, Step3CadStatus } from "../types/cad";
import type { Project } from "../types/project";

export function createInitialCadResult(): CadResult {
  return {
    status: "idle",
    cadDrawings: [],
  };
}

function ensureCadResult(project: Project): CadResult {
  if (!project.cadResult) {
    project.cadResult = createInitialCadResult();
  }
  if (!project.cadResult.cadDrawings) {
    project.cadResult.cadDrawings = [];
  }
  return project.cadResult;
}

export async function updateCadStatus(project: Project, status: Step3CadStatus): Promise<void> {
  const cadResult = ensureCadResult(project);
  cadResult.status = status;

  if (status === "completed") {
    project.stepStatuses["3"] = "completed";
    return;
  }

  if (status === "failed") {
    project.stepStatuses["3"] = "failed";
    return;
  }

  project.stepStatuses["3"] = "processing";
}

export async function saveCadPendingState(project: Project, input: {
  status: Step3CadStatus;
  jsonSchemaUrl: string;
  telegramRequestMessageId: number;
  sentToAdminAt: string;
}): Promise<void> {
  const cadResult = ensureCadResult(project);
  cadResult.status = input.status;
  cadResult.jsonSchemaUrl = input.jsonSchemaUrl;
  cadResult.telegramRequestMessageId = input.telegramRequestMessageId;
  cadResult.sentToAdminAt = input.sentToAdminAt;
  project.stepStatuses["3"] = "processing";
}

export async function appendCadDrawing(project: Project, drawing: CadDrawingItem): Promise<void> {
  const cadResult = ensureCadResult(project);
  cadResult.cadDrawings.push(drawing);
}

export async function updateCadCompleted(project: Project, input: {
  receivedFromAdminAt: string;
}): Promise<void> {
  const cadResult = ensureCadResult(project);
  cadResult.status = "completed";
  cadResult.receivedFromAdminAt = input.receivedFromAdminAt;
  project.stepStatuses["3"] = "completed";
  project.progress = Math.max(project.progress, 80);
}
