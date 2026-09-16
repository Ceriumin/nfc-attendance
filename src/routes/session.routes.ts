import * as sessionController from "@/controllers/session.controller.ts";
import { requireRole } from "@/middleware/auth.ts";
import { Router } from "express";

const sessionRouter = Router();

/* ————————— Read (any authenticated user) ————————— */
// Sessions aren't student-owned data, so any signed-in user may read them. Supports ?classId=

sessionRouter.get("/", sessionController.getSessions);

sessionRouter.get("/:id", sessionController.getSessionById);

/* ————————— Administrative Endpoints ————————— */

sessionRouter.post("/", requireRole("admin"), sessionController.createSession);

sessionRouter.put("/:id", requireRole("admin"), sessionController.updateSession);

sessionRouter.delete("/:id", requireRole("admin"), sessionController.deleteSession);

export default sessionRouter;
