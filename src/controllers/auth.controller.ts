import type { Request, Response, NextFunction } from "express";
import * as authService from "@/services/auth.service.ts";

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        return res.status(200).json(await authService.login(req.body));
    } catch (error) {
        next(error);
    }
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        return res.status(201).json(await authService.register(req.body));
    } catch (error) {
        next(error);
    }
}
