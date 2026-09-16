import type { Request, Response, NextFunction } from "express";
import * as sessionService from "@/services/session.service.ts";

export async function getSessions(req: Request, res: Response, next: NextFunction) {
    try {
        const sessions = await sessionService.getSessions(req.query);
        return res.status(200).json(sessions);
    } catch (error) {
        next(error);
    }
}

export async function getSessionById(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await sessionService.getSessionById(Number(req.params.id));
        return res.status(200).json(session);
    } catch (error) {
        next(error);
    }
}

/* ————————— Administrative Endpoints ————————— */

export async function createSession(req: Request, res: Response, next: NextFunction) {
    try {
        const created = await sessionService.createSession(req.body);
        return res.status(201).json(created);
    } catch (error) {
        next(error);
    }
}

export async function updateSession(req: Request, res: Response, next: NextFunction) {
    try {
        const updated = await sessionService.updateSession(Number(req.params.id), req.body);
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function deleteSession(req: Request, res: Response, next: NextFunction) {
    try {
        await sessionService.deleteSession(Number(req.params.id));
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}
