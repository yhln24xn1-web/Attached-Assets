import { Router } from "express";
import { handleTelegramWebhookUpdate } from "../telegram/webhookHandler";

const router = Router();

interface TelegramWebhookBody {
  message?: unknown;
}

router.post("/webhook", async (req, res) => {
  try {
    const body = req.body as unknown;
    if (typeof body !== "object" || body == null || Array.isArray(body)) {
      res.status(400).json({ ok: false, error: "Invalid webhook payload" });
      return;
    }
    const result = await handleTelegramWebhookUpdate(body as TelegramWebhookBody);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
