import { getProjectById } from "./projectStore";
import type { CadDrawingItem, Step3CadStatus } from "../types/cad";

export async function updateCadStatus(
  projectId: string,
  status: Step3CadStatus,
  extra?: Record<string, unknown>,
) {
  const project = getProjectById(Number(projectId));
  if (!project) throw new Error(`Dự án không tồn tại: ${projectId}`);

  project.cadResult = {
    ...project.cadResult,
    ...extra,
    status,
    cadDrawings: project.cadResult.cadDrawings ?? [],
  };
  if (status === "completed") {
    project.stepStatuses["3"] = "completed";
  } else if (status === "failed") {
    project.stepStatuses["3"] = "failed";
  } else {
    project.stepStatuses["3"] = "processing";
  }

  return project.cadResult;
}

export async function appendCadDrawing(projectId: string, drawing: CadDrawingItem) {
  const project = getProjectById(Number(projectId));
  if (!project) throw new Error(`Dự án không tồn tại: ${projectId}`);

  project.cadResult.cadDrawings.push(drawing);
  return project.cadResult;
}
