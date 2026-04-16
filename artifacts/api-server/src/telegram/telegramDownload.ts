interface TelegramGetFileResponse {
  ok: boolean;
  result?: {
    file_path?: string;
  };
  description?: string;
}

function getToken() {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }
  return token;
}

export async function downloadTelegramFile(fileId: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const token = getToken();

  const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`);
  const getFileData = (await getFileRes.json()) as TelegramGetFileResponse;

  const filePath = getFileData.result?.file_path;
  if (!getFileRes.ok || !getFileData.ok || !filePath) {
    throw new Error(getFileData.description ?? "Failed to resolve Telegram file path");
  }

  const downloadRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
  if (!downloadRes.ok) {
    throw new Error(`Failed to download Telegram file: HTTP ${downloadRes.status}`);
  }

  const mimeType = downloadRes.headers.get("content-type") ?? "image/jpeg";
  const arrayBuffer = await downloadRes.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType,
  };
}
