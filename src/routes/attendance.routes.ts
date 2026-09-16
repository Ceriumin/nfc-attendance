import * as attendanceController from "@/controllers/attendance.controller.ts";
import * as attendanceRepository from "@/repository/attendance.repository.ts";
import { requireRole } from "@/middleware/auth.ts";
import { scopeToOwnStudent, requireResourceOwnership } from "@/middleware/ownership.ts";
import { Router } from "express";

const attendanceRouter = Router();

const loadAttendanceOwner = async (id: number) =>
    (await attendanceRepository.getAttendanceById(id))?.student_id ?? null;

/* ————————— Read ————————— */

// A student may read only their own attendance records.
attendanceRouter.get("/:id", requireResourceOwnership(loadAttendanceOwner), attendanceController.getAttendanceById);

attendanceRouter.get("/", scopeToOwnStudent, attendanceController.getAttendance);

/* ————————— Administrative Endpoints ————————— */

attendanceRouter.post("/", requireRole("teacher", "admin"), attendanceController.createAttendance);

attendanceRouter.put("/:id", requireRole("teacher", "admin"), attendanceController.updateAttendance);

attendanceRouter.delete("/:id", requireRole("teacher", "admin"), attendanceController.deleteAttendance);

/* ————————— Tap Endpoint ————————— */
// NOTE: this is hit by the NFC reader, not an end user. It currently requires a
// teacher/admin token; give the reader its own credential (see the reader-auth note).
attendanceRouter.post("/tap", requireRole("teacher", "admin"), attendanceController.createAttendanceByTap);

export default attendanceRouter;
