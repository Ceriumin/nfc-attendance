import * as classController from "@/controllers/class.controller.ts";
import { requireRole } from "@/middleware/auth.ts";
import { Router } from "express";

const classRouter = Router();

/* ————————— Read (any authenticated user) ————————— */
// Classes aren't student-owned data, so any signed-in user may read them.

classRouter.get("/", classController.getAllClasses);

classRouter.get("/:id", classController.getClassById);

/* ————————— Administrative Endpoints ————————— */

classRouter.post("/", requireRole("admin"), classController.createClass);

classRouter.put("/:id", requireRole("admin"), classController.updateClass);

classRouter.delete("/:id", requireRole("admin"), classController.deleteClass);

export default classRouter;
