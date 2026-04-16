import type { Project } from "../types/project";

interface TelegramMessageLite {
  text?: string;
  caption?: string;
  reply_to_message?: {
    message_id?: number;
  };
}

const JOB_ID_REGEX = /JOB\s{0,3}ID\s*[:#-]?\s*(\d+)/i;

function parseJobId(text?: string): number | null {
  if (!text) return null;
  const match = text.match(JOB_ID_REGEX);
  if (!match?.[1]) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function resolveProjectFromTelegramMessage(
  message: TelegramMessageLite,
  projects: Project[],
): Promise<{ projectId: string; project: Project } | null> {
  const replyMessageId = message.reply_to_message?.message_id;
  if (replyMessageId) {
    const matchedByReply = projects.find(
      (project) => project.cadResult?.telegramRequestMessageId === replyMessageId,
    );
    if (matchedByReply) {
      return { projectId: String(matchedByReply.id), project: matchedByReply };
    }
  }

  const jobId = parseJobId(message.caption ?? message.text);
  if (jobId !== null) {
    const matchedByJobId = projects.find((project) => project.id === jobId);
    if (matchedByJobId) {
      return { projectId: String(matchedByJobId.id), project: matchedByJobId };
    }
  }

  return null;
}
