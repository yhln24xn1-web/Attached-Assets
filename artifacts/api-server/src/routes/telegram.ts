import { Router } from "express";
import { createTelegramWebhookHandler } from "../telegram/webhookHandler";
import { PROJECTS } from "./projects";

const router = Router();

router.post("/webhook", createTelegramWebhookHandler(PROJECTS));

export default router;
