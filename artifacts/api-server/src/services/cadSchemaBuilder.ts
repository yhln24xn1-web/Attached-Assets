import type { CadSchema } from "../types/cad";
import type { Project } from "../types/project";

export async function buildCadSchema(_projectId: string, project: Project): Promise<CadSchema> {
  if (!project.layoutResult) {
    throw new Error("Layout result is required before CAD schema generation");
  }

  const targetSetback = project.wizardData?.chatRequirements?.extractedData?.setback ?? null;

  const stairRooms = project.layoutResult.floors.flatMap((floor) =>
    floor.geometry
      .filter((room) => room.type === "stair")
      .map((room) => ({
        floor: floor.floor,
        roomId: room.id,
        x: room.x,
        y: room.y,
        width: room.width,
        height: room.height,
      })),
  );

  const shaftRooms = project.layoutResult.floors.flatMap((floor) =>
    floor.geometry
      .filter((room) => room.type === "shaft")
      .map((room) => ({
        floor: floor.floor,
        roomId: room.id,
        x: room.x,
        y: room.y,
        width: room.width,
        height: room.height,
      })),
  );

  return {
    metadata: {
      jobId: project.id,
      projectId: project.id,
      projectName: project.title,
      schemaVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
    },
    projectInfo: {
      clientName: project.client,
      floors: project.floors,
      lotWidth: project.width,
      lotLength: project.length,
      bedrooms: project.bedrooms,
      bathrooms: project.wizardData?.basicInfo?.bathrooms ?? 0,
      budget: project.budget,
    },
    floors: project.layoutResult.floors.map((floor) => ({
      floor: floor.floor,
      floorName: floor.floorName,
      rooms: floor.rooms,
    })),
    dimensions: {
      buildableWidth: project.layoutResult.buildableWidth,
      buildableDepth: project.layoutResult.buildableDepth,
    },
    roomData: project.layoutResult.floors.map((floor) => ({
      floor: floor.floor,
      floorName: floor.floorName,
      geometry: floor.geometry,
    })),
    grid: {
      unit: "m",
      snap: 0.1,
    },
    stairsCore: {
      stairRooms,
      shaftRooms,
    },
    cadDescription: "Bản vẽ kỹ thuật mặt bằng theo dữ liệu đã xác nhận.",
    constraints: {
      noRoomOverlap: true,
      widthFits: true,
      depthFits: true,
      stairCoreConsistent: true,
      targetSetback,
    },
  };
}
