import { Router } from "express";
import { handleTelegramWebhookUpdate } from "../telegram/webhookHandler";

const router = Router();

router.post("/webhook", async (req, res) => {
  try {
    const result = await handleTelegramWebhookUpdate(req.body as { message?: any });
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
