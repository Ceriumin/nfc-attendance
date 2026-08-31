import * as attendanceController from "@/controllers/attendance.controller.ts";
import { Router } from "express";

const attendanceRouter = Router();

attendanceRouter.get("/:id", attendanceController.getAttendanceById);

attendanceRouter.get("/", attendanceController.getAttendance);

/* ————————— Administrative Endpoints ————————— */

attendanceRouter.post("/", attendanceController.createAttendance);

attendanceRouter.put("/:id", attendanceController.updateAttendance);

attendanceRouter.delete("/:id", attendanceController.deleteAttendance);


/* ————————— Tap Endpoint ————————— */

attendanceRouter.post("/tap", attendanceController.createAttendanceByTap);

export default attendanceRouter;
