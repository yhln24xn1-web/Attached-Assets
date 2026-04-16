import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(cookieParser(process.env["SESSION_SECRET"] ?? "bmt-decor-secret-change-in-production"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "public");
  const indexPath = path.join(publicPath, "index.html");
  const hasIndex = fs.existsSync(indexPath);
  logger.info({ publicPath, indexPath, hasIndex, __dirname, cwd: process.cwd() }, "Static file serving config");

  if (hasIndex) {
    app.use(express.static(publicPath));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    const dirContents = fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : "DIR_NOT_FOUND";
    const distContents = fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : "DIRNAME_NOT_FOUND";
    logger.error({ publicPath, dirContents, distContents }, "index.html not found — static serving disabled");
  }
}

export default app;
