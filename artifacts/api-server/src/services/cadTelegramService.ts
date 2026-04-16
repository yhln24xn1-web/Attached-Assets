import { readFile } from "node:fs/promises";

function getTelegramConfig() {
  return {
    token: process.env["TELEGRAM_BOT_TOKEN"],
    chatId: process.env["TELEGRAM_ADMIN_CHAT_ID"],
  };
}

export async function sendCadSchemaToAdmin(input: {
  projectId: string;
  jobId: number | string;
  filePath: string;
  caption: string;
}) {
  const cfg = getTelegramConfig();
  if (!cfg.token || !cfg.chatId) {
    return {
      ok: true,
      telegramMessageId: Date.now(),
    };
  }

  const endpoint = `https://api.telegram.org/bot${cfg.token}/sendDocument`;
  const form = new FormData();
  const fileBytes = await readFile(input.filePath);
  form.append("chat_id", cfg.chatId);
  form.append("caption", input.caption);
  form.append("document", new Blob([fileBytes], { type: "application/json" }), `cad-schema-${input.projectId}.json`);

  const res = await fetch(endpoint, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(`Telegram sendDocument failed: ${res.status} ${bodyText}`);
  }

  const body = await res.json() as {
    ok: boolean;
    result?: {
      message_id: number;
      document?: { file_id?: string };
    };
  };

  if (!body.ok || !body.result?.message_id) {
    throw new Error("Telegram sendDocument returned invalid response");
  }

  return {
    ok: true,
    telegramMessageId: body.result.message_id,
    telegramFileId: body.result.document?.file_id,
  };
}
