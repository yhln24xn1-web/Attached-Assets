import { resolveProjectFromTelegramMessage } from "./telegramResolver";
import { downloadTelegramFile } from "./telegramDownload";
import { saveCadDrawingImage } from "../services/cadStorageService";
import { appendCadDrawing, updateCadStatus } from "../services/cadStatusService";

interface TelegramPhotoSize {
  file_id: string;
  width: number;
  height: number;
}

interface TelegramMessage {
  message_id: number;
  caption?: string;
  photo?: TelegramPhotoSize[];
  reply_to_message?: {
    message_id?: number;
  };
}

function pickLargestPhoto(photos: TelegramPhotoSize[]) {
  return [...photos].sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
}

export async function handleTelegramWebhookUpdate(update: { message?: TelegramMessage }) {
  const message = update.message;
  if (!message?.photo?.length) return { ok: true, ignored: true };

  const resolved = await resolveProjectFromTelegramMessage(message);
  if (!resolved) return { ok: true, ignored: true };

  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");

  await updateCadStatus(String(resolved.projectId), "receiving_admin_cad");

  const photo = pickLargestPhoto(message.photo);
  if (!photo) return { ok: true, ignored: true };

  const downloaded = await downloadTelegramFile(photo.file_id, token);
  const savedDrawing = await saveCadDrawingImage({
    projectId: String(resolved.projectId),
    bytes: downloaded.bytes,
    mimeType: downloaded.mimeType,
    telegramFileId: photo.file_id,
    telegramMessageId: message.message_id,
    caption: message.caption,
  });

  await appendCadDrawing(String(resolved.projectId), savedDrawing);
  await updateCadStatus(String(resolved.projectId), "completed", {
    receivedFromAdminAt: new Date().toISOString(),
  });

  return { ok: true };
}
