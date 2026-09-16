import * as enrolmentController from "@/controllers/enrolment.controller.ts";
import * as enrolmentRepository from "@/repository/enrolment.repository.ts";
import { requireRole } from "@/middleware/auth.ts";
import { scopeToOwnStudent, requireResourceOwnership } from "@/middleware/ownership.ts";
import { Router } from "express";

const enrolmentRouter = Router();

const loadEnrolmentOwner = async (id: number) =>
    (await enrolmentRepository.getEnrolmentById(id))?.student_id ?? null;

/* ————————— Read ————————— */

// A student sees only their own enrolments; teachers/admins see all.
enrolmentRouter.get("/", scopeToOwnStudent, enrolmentController.getEnrolments);

enrolmentRouter.get("/:id", requireResourceOwnership(loadEnrolmentOwner), enrolmentController.getEnrolmentById);

/* ————————— Administrative Endpoints ————————— */

enrolmentRouter.post("/", requireRole("admin"), enrolmentController.createEnrolment);

enrolmentRouter.delete("/:id", requireRole("admin"), enrolmentController.deleteEnrolment);

export default enrolmentRouter;
