import { PROJECTS } from "../services/projectStore";

interface TelegramMessageLike {
  caption?: string;
  reply_to_message?: {
    message_id?: number;
  };
}

function parseJobId(caption?: string) {
  if (!caption) return null;
  const match = caption.match(/JOB\s*ID\s*[:#-]?\s*(\d+)/i);
  if (!match?.[1]) return null;
  return Number(match[1]);
}

export async function resolveProjectFromTelegramMessage(message: TelegramMessageLike) {
  const replyMessageId = message.reply_to_message?.message_id;
  if (replyMessageId != null) {
    const byReply = PROJECTS.find((p) => p.cadResult.telegramRequestMessageId === replyMessageId);
    if (byReply) return { projectId: byReply.id };
  }

  const jobId = parseJobId(message.caption);
  if (jobId != null) {
    const byJob = PROJECTS.find((p) => p.id === jobId);
    if (byJob) return { projectId: byJob.id };
  }

  return null;
}
