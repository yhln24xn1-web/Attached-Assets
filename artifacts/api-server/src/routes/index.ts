import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/projects", projectsRouter);
router.use("/telegram", telegramRouter);

export default router;
