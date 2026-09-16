import type { Request, Response, NextFunction } from "express";
import * as enrolmentService from "@/services/enrolment.service.ts";

export async function getEnrolments(req: Request, res: Response, next: NextFunction) {
    try {
        const enrolments = await enrolmentService.getEnrolments(req.query);
        return res.status(200).json(enrolments);
    } catch (error) {
        next(error);
    }
}

export async function getEnrolmentById(req: Request, res: Response, next: NextFunction) {
    try {
        const enrolment = await enrolmentService.getEnrolmentById(Number(req.params.id));
        return res.status(200).json(enrolment);
    } catch (error) {
        next(error);
    }
}

/* ————————— Administrative Endpoints ————————— */

export async function createEnrolment(req: Request, res: Response, next: NextFunction) {
    try {
        const created = await enrolmentService.createEnrolment(req.body);
        return res.status(201).json(created);
    } catch (error) {
        next(error);
    }
}

export async function deleteEnrolment(req: Request, res: Response, next: NextFunction) {
    try {
        await enrolmentService.deleteEnrolment(Number(req.params.id));
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}
