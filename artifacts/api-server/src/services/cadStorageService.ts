import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { CadDrawingItem, CadSchema } from "../types/cad";

function getCadRootDir() {
  return path.join(process.cwd(), "data", "cad");
}

function getCadProjectDir(projectId: string | number) {
  return path.join(getCadRootDir(), String(projectId));
}

async function ensureProjectDir(projectId: string | number) {
  const projectDir = getCadProjectDir(projectId);
  await fs.mkdir(projectDir, { recursive: true });
  return projectDir;
}

function extByMime(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

export async function saveCadSchemaFile(projectId: string | number, schema: CadSchema): Promise<{
  filePath: string;
  fileName: string;
  url: string;
}> {
  const projectDir = await ensureProjectDir(projectId);
  const fileName = `cad-schema-${Date.now()}.json`;
  const filePath = path.join(projectDir, fileName);

  await fs.writeFile(filePath, JSON.stringify(schema, null, 2), "utf-8");

  return {
    filePath,
    fileName,
    url: `/api/projects/${projectId}/cad-files/${encodeURIComponent(fileName)}`,
  };
}

export async function saveCadDrawingImage(projectId: string | number, input: {
  buffer: Buffer;
  mimeType: string;
  floor?: number;
  floorName?: string;
  telegramFileId?: string;
  telegramMessageId?: number;
  caption?: string;
}): Promise<CadDrawingItem> {
  const projectDir = await ensureProjectDir(projectId);
  const ext = extByMime(input.mimeType);
  const fileName = `cad-drawing-${Date.now()}-${randomUUID()}.${ext}`;
  const filePath = path.join(projectDir, fileName);

  await fs.writeFile(filePath, input.buffer);

  return {
    id: randomUUID(),
    floor: input.floor,
    floorName: input.floorName,
    imageUrl: `/api/projects/${projectId}/cad-files/${encodeURIComponent(fileName)}`,
    telegramFileId: input.telegramFileId,
    telegramMessageId: input.telegramMessageId,
    caption: input.caption,
    createdAt: new Date().toISOString(),
  };
}

export function resolveCadProjectFilePath(projectId: string | number, fileName: string): string {
  const safeFileName = path.basename(fileName);
  return path.join(getCadProjectDir(projectId), safeFileName);
}
