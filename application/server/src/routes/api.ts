import bodyParser from "body-parser";
import { Router, NextFunction, Request, Response } from "express";
import httpErrors from "http-errors";
import { ValidationError } from "sequelize";

import { authRouter } from "@web-speed-hackathon-2026/server/src/routes/api/auth";
import { crokRouter } from "@web-speed-hackathon-2026/server/src/routes/api/crok";
import { directMessageRouter } from "@web-speed-hackathon-2026/server/src/routes/api/direct_message";
import { imageRouter } from "@web-speed-hackathon-2026/server/src/routes/api/image";
import { initializeRouter } from "@web-speed-hackathon-2026/server/src/routes/api/initialize";
import { movieRouter } from "@web-speed-hackathon-2026/server/src/routes/api/movie";
import { postRouter } from "@web-speed-hackathon-2026/server/src/routes/api/post";
import { searchRouter } from "@web-speed-hackathon-2026/server/src/routes/api/search";
import { soundRouter } from "@web-speed-hackathon-2026/server/src/routes/api/sound";
import { userRouter } from "@web-speed-hackathon-2026/server/src/routes/api/user";

const rawBodyParser = bodyParser.raw({ limit: "10mb" });

export const apiRouter = Router();

// Set Cache-Control headers for API responses based on endpoint characteristics
apiRouter.use((req, res, next) => {
  if (req.method === "GET") {
    // Authenticated endpoints: private cache, must revalidate
    if (req.path === "/me" || req.path.startsWith("/dm")) {
      res.setHeader("Cache-Control", "private, no-cache");
    } else {
      // Public read endpoints (posts, users, search, comments): allow short caching
      res.setHeader("Cache-Control", "public, max-age=5, stale-while-revalidate=30");
    }
  }
  next();
});

apiRouter.use(initializeRouter);
apiRouter.use(userRouter);
apiRouter.use(postRouter);
apiRouter.use(directMessageRouter);
apiRouter.use(searchRouter);
apiRouter.post("/movies", rawBodyParser);
apiRouter.use(movieRouter);
apiRouter.post("/images", rawBodyParser);
apiRouter.use(imageRouter);
apiRouter.post("/sounds", rawBodyParser);
apiRouter.use(soundRouter);
apiRouter.use(authRouter);
apiRouter.use(crokRouter);

apiRouter.use(async (err: Error, _req: Request, _res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    throw new httpErrors.BadRequest();
  }
  throw err;
});

apiRouter.use(
  async (err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = httpErrors.isHttpError(err)
      ? err.status
      : typeof err.status === "number" && err.status >= 400 && err.status < 600
        ? err.status
        : 500;

    if (status === 500) {
      console.error(err);
    }

    return res.status(status).type("application/json").send({
      message: err.message,
    });
  },
);
