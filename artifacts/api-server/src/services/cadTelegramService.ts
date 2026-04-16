import fs from "fs/promises";

interface TelegramSendDocumentResponse {
  ok: boolean;
  result?: {
    message_id: number;
    document?: {
      file_id?: string;
    };
  };
  description?: string;
}

function getTelegramConfig() {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  const chatId = process.env["TELEGRAM_ADMIN_CHAT_ID"];

  if (!token || !chatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID");
  }

  return { token, chatId };
}

export async function sendCadSchemaToAdmin(input: {
  projectId: string;
  jobId: number | string;
  filePath: string;
  caption: string;
}): Promise<{
  ok: boolean;
  telegramMessageId: number;
  telegramFileId?: string;
}> {
  const { token, chatId } = getTelegramConfig();
  const fileBuffer = await fs.readFile(input.filePath);
  const fileName = `cad-schema-${input.projectId}.json`;

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", input.caption);
  form.append("document", new Blob([fileBuffer], { type: "application/json" }), fileName);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: "POST",
    body: form,
  });

  const payload = (await response.json()) as TelegramSendDocumentResponse;

  if (!response.ok || !payload.ok || !payload.result?.message_id) {
    throw new Error(payload.description ?? "Failed to send CAD schema to Telegram");
  }

  return {
    ok: true,
    telegramMessageId: payload.result.message_id,
    telegramFileId: payload.result.document?.file_id,
  };
}
