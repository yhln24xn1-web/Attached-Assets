import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { CadSchema, CadDrawingItem } from "../types/cad";

const CAD_STORAGE_ROOT = path.join(process.cwd(), "attached_assets", "cad");

async function ensureStorageDir() {
  await mkdir(CAD_STORAGE_ROOT, { recursive: true });
}

export async function saveCadSchemaFile(projectId: string, cadSchema: CadSchema) {
  await ensureStorageDir();
  const filename = `project-${projectId}-schema-${Date.now()}.json`;
  const filePath = path.join(CAD_STORAGE_ROOT, filename);
  await writeFile(filePath, JSON.stringify(cadSchema, null, 2), "utf8");
  return { filePath, url: filePath };
}

export async function saveCadDrawingImage(input: {
  projectId: string;
  bytes: Uint8Array;
  mimeType: string;
  telegramFileId?: string;
  telegramMessageId?: number;
  caption?: string;
}) : Promise<CadDrawingItem> {
  await ensureStorageDir();
  const ext = input.mimeType.includes("png") ? "png" : "jpg";
  const filename = `project-${input.projectId}-cad-${Date.now()}-${randomUUID()}.${ext}`;
  const filePath = path.join(CAD_STORAGE_ROOT, filename);

  await writeFile(filePath, Buffer.from(input.bytes));

  const imageUrl = `data:${input.mimeType};base64,${Buffer.from(input.bytes).toString("base64")}`;

  return {
    id: randomUUID(),
    imageUrl,
    telegramFileId: input.telegramFileId,
    telegramMessageId: input.telegramMessageId,
    caption: input.caption,
    createdAt: new Date().toISOString(),
  };
}
