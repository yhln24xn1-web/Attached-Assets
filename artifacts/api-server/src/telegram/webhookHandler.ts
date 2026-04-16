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

function asTelegramMessage(value: unknown): TelegramMessage | null {
  if (typeof value !== "object" || value == null) return null;
  const msg = value as Partial<TelegramMessage>;
  if (typeof msg.message_id !== "number") return null;
  if (msg.photo != null && !Array.isArray(msg.photo)) return null;
  if (Array.isArray(msg.photo)) {
    const hasInvalidPhoto = msg.photo.some(
      (photo) =>
        typeof photo !== "object"
        || photo == null
        || typeof (photo as Partial<TelegramPhotoSize>).file_id !== "string"
        || typeof (photo as Partial<TelegramPhotoSize>).width !== "number"
        || typeof (photo as Partial<TelegramPhotoSize>).height !== "number",
    );
    if (hasInvalidPhoto) return null;
  }
  return msg as TelegramMessage;
}

function pickLargestPhoto(photos: TelegramPhotoSize[]) {
  return [...photos].sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
}

export async function handleTelegramWebhookUpdate(update: { message?: unknown }) {
  const message = asTelegramMessage(update.message);
  if (!message?.photo?.length) return { ok: true, ignored: true };

  const resolved = await resolveProjectFromTelegramMessage(message);
  if (!resolved) return { ok: true, ignored: true };

  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new Error("Thiếu cấu hình TELEGRAM_BOT_TOKEN cho webhook Telegram");

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
