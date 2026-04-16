import { buildLayoutInput, runLayoutSkill } from "../layout-skill";
import { getProjectById } from "./projectStore";
import type { CadSchema } from "../types/cad";

function buildGridLines(size: number) {
  const lines: number[] = [];
  const max = Math.max(1, Math.ceil(size));
  for (let i = 0; i <= max; i += 1) lines.push(i);
  return lines;
}

export async function buildCadSchema(projectId: string): Promise<CadSchema> {
  const project = getProjectById(Number(projectId));
  if (!project) throw new Error("Dự án không tồn tại");

  const wd = project.wizardData;
  const bi = wd?.basicInfo;
  const cf = wd?.chatRequirements?.extractedData;
  const fup = wd?.chatRequirements?.followupAnswers;

  let layout = project.layoutResult;
  if (!layout) {
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

    const output = await runLayoutSkill(skillInput);
    if (!output.passed || !output.finalCleanJson) {
      throw new Error("Không thể tạo dữ liệu CAD schema");
    }
    layout = output.finalCleanJson;
    project.layoutResult = layout;
  }

  const roomData = layout.floors.flatMap((floor) =>
    floor.rooms.map((room) => ({
      floor: floor.floor,
      floorName: floor.floorName,
      name: room.name,
      type: room.type,
      area: room.area,
    })));

  return {
    metadata: {
      jobId: project.id,
      projectId: project.id,
      projectName: project.title,
      createdAt: new Date().toISOString(),
    },
    projectInfo: {
      lotWidth: bi?.lotWidth ?? project.width,
      lotLength: bi?.lotLength ?? project.length,
      floors: bi?.floors ?? project.floors,
      bedrooms: bi?.bedrooms ?? project.bedrooms,
      budget: bi?.budget ?? project.budget,
    },
    floors: layout.floors,
    dimensions: {
      buildableWidth: layout.buildableWidth,
      buildableDepth: layout.buildableDepth,
    },
    roomData,
    grid: {
      unit: "m",
      xLines: buildGridLines(layout.buildableWidth),
      yLines: buildGridLines(layout.buildableDepth),
    },
    stairsCore: layout.floors.map((floor) => ({
      floor: floor.floor,
      items: floor.geometry
        .filter((item) => item.type === "stair" || item.type === "shaft")
        .map((item) => ({
          id: item.id,
          type: item.type,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
        })),
    })),
    cadDescription: "AutoCAD technical floor plan package.",
    constraints: {
      setback: cf?.setback,
      buildLength: cf?.buildLength,
      groundBuildArea: cf?.groundBuildArea,
      totalConstructionArea: cf?.totalConstructionArea,
      updatedBudget: cf?.updatedBudget,
    },
  };
}
