interface TelegramFileResponse {
  ok: boolean;
  result?: {
    file_id: string;
    file_path: string;
  };
}

export async function downloadTelegramFile(fileId: string, token: string) {
  const fileInfoRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`);
  if (!fileInfoRes.ok) throw new Error(`Telegram getFile failed: ${fileInfoRes.status}`);

  const fileInfo = await fileInfoRes.json() as TelegramFileResponse;
  if (!fileInfo.ok || !fileInfo.result?.file_path) throw new Error("Telegram getFile returned invalid payload");

  const fileUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.result.file_path}`;
  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) throw new Error(`Telegram file download failed: ${fileRes.status}`);

  const buffer = new Uint8Array(await fileRes.arrayBuffer());
  const mimeType = fileRes.headers.get("content-type") ?? "image/jpeg";

  return {
    bytes: buffer,
    mimeType,
    filePath: fileInfo.result.file_path,
  };
}
