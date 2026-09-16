import type { Request, Response, NextFunction } from "express";
import * as classService from "@/services/class.service.ts";

export async function getAllClasses(_req: Request, res: Response, next: NextFunction) {
    try {
        const classes = await classService.getAllClasses();
        return res.status(200).json(classes);
    } catch (error) {
        next(error);
    }
}

export async function getClassById(req: Request, res: Response, next: NextFunction) {
    try {
        const found = await classService.getClassById(Number(req.params.id));
        return res.status(200).json(found);
    } catch (error) {
        next(error);
    }
}

/* ————————— Administrative Endpoints ————————— */

export async function createClass(req: Request, res: Response, next: NextFunction) {
    try {
        const created = await classService.createClass(req.body);
        return res.status(201).json(created);
    } catch (error) {
        next(error);
    }
}

export async function updateClass(req: Request, res: Response, next: NextFunction) {
    try {
        const updated = await classService.updateClass(Number(req.params.id), req.body);
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
        await classService.deleteClass(Number(req.params.id));
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}
