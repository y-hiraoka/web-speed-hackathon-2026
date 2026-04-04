import bodyParser from "body-parser";
import Express from "express";

import { apiRouter } from "@web-speed-hackathon-2026/server/src/routes/api";
import { staticRouter } from "@web-speed-hackathon-2026/server/src/routes/static";
import { sessionMiddleware } from "@web-speed-hackathon-2026/server/src/session";

export const app = Express();

app.set("trust proxy", true);
app.set("etag", false);

app.use(sessionMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.raw({ limit: "100mb" }));

app.use((_req, res, next) => {
  res.header({
    "Cache-Control": "max-age=0, no-transform",
    Connection: "close",
  });
  return next();
});

app.use("/api/v1", apiRouter);
app.use(staticRouter);
