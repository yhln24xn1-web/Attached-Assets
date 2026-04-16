import type { Request, Response } from "express";
import { logger } from "../lib/logger";
import { saveCadDrawingImage } from "../services/cadStorageService";
import { appendCadDrawing, updateCadCompleted, updateCadStatus } from "../services/cadStatusService";
import { downloadTelegramFile } from "./telegramDownload";
import { resolveProjectFromTelegramMessage } from "./telegramResolver";
import type { Project } from "../types/project";

interface TelegramPhotoSize {
  file_id: string;
  file_size?: number;
}

interface TelegramMessage {
  message_id?: number;
  text?: string;
  caption?: string;
  reply_to_message?: {
    message_id?: number;
  };
  photo?: TelegramPhotoSize[];
  document?: {
    file_id: string;
    mime_type?: string;
  };
}

interface TelegramWebhookBody {
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

function extractImageFileIds(message: TelegramMessage): string[] {
  const result: string[] = [];

  if (message.photo && message.photo.length > 0) {
    const largest = [...message.photo].sort((a, b) => (b.file_size ?? 0) - (a.file_size ?? 0))[0];
    if (largest?.file_id) {
      result.push(largest.file_id);
    }
  }

  if (message.document?.file_id && message.document.mime_type?.startsWith("image/")) {
    result.push(message.document.file_id);
  }

  return result;
}

export function createTelegramWebhookHandler(projects: Project[]) {
  return async function telegramWebhookHandler(req: Request, res: Response) {
    try {
      const body = req.body as TelegramWebhookBody;
      const message = body.message ?? body.edited_message;

      if (!message) {
        res.json({ ok: true, ignored: "no_message" });
        return;
      }

      const resolved = await resolveProjectFromTelegramMessage(message, projects);
      if (!resolved) {
        res.json({ ok: true, ignored: "project_not_resolved" });
        return;
      }

      const fileIds = extractImageFileIds(message);
      if (fileIds.length === 0) {
        res.json({ ok: true, ignored: "no_image" });
        return;
      }

      await updateCadStatus(resolved.project, "receiving_admin_cad");

      for (const fileId of fileIds) {
        const downloaded = await downloadTelegramFile(fileId);
        const saved = await saveCadDrawingImage(resolved.projectId, {
          buffer: downloaded.buffer,
          mimeType: downloaded.mimeType,
          telegramFileId: fileId,
          telegramMessageId: message.message_id,
          caption: message.caption,
        });
        await appendCadDrawing(resolved.project, saved);
      }

      await updateCadCompleted(resolved.project, {
        receivedFromAdminAt: new Date().toISOString(),
      });

      res.json({ ok: true });
    } catch (error) {
      logger.error({ err: error }, "Telegram webhook failed");
      res.status(500).json({ ok: false });
    }
  };
}
