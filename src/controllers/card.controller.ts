import type { Request, Response, NextFunction } from "express";
import * as cardService from "@/services/card.service.ts";

export async function getCards(req: Request, res: Response, next: NextFunction) {
    try {
        const cards = await cardService.getCards(req.query);
        return res.status(200).json(cards);
    } catch (error) {
        next(error);
    }
}

export async function getCardById(req: Request, res: Response, next: NextFunction) {
    try {
        const card = await cardService.getCardById(Number(req.params.id));
        return res.status(200).json(card);
    } catch (error) {
        next(error);
    }
}

/* ————————— Administrative Endpoints ————————— */

export async function createCard(req: Request, res: Response, next: NextFunction) {
    try {
        const created = await cardService.createCard(req.body);
        return res.status(201).json(created);
    } catch (error) {
        next(error);
    }
}

export async function deleteCard(req: Request, res: Response, next: NextFunction) {
    try {
        await cardService.deleteCard(Number(req.params.id));
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}
