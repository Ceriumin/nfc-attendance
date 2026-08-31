import type { Request, Response, NextFunction } from "express";
import * as attendanceService from "@/services/attendance.service.ts";

export async function getAttendanceById(req: Request, res: Response, next: NextFunction) {
    try {
        const attendance = await attendanceService.getAttendanceById(Number(req.params.id));
        return res.status(200).json(attendance);
    } catch (error) {
        next(error);
    }
}

export async function getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
        const attendance = await attendanceService.getAttendance(req.query);
        return res.status(200).json(attendance);
    } catch (error) {
        next(error);
    }
}

/* ————————— Administrative Endpoints ————————— */

export async function createAttendance(req: Request, res: Response, next: NextFunction) {
    try {
        const attendance = await attendanceService.createAttendance(req.body);
        return res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
}

export async function updateAttendance(req: Request, res: Response, next: NextFunction) {
    try {
        const attendance = await attendanceService.updateAttendance(Number(req.params.id), req.body);
        return res.status(200).json(attendance);
    } catch (error) {
        next(error);
    }
}

export async function deleteAttendance(req: Request, res: Response, next: NextFunction) {
    try {
        await attendanceService.deleteAttendance(Number(req.params.id));
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}

/* ————————— Tap Endpoint ————————— */

export async function createAttendanceByTap(req: Request, res: Response, next: NextFunction) {
    try {
        const { cardUid, classId } = req.body;
        const attendance = await attendanceService.createAttendanceByTap(
            cardUid,
            Number(classId),
        );
        return res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
}


