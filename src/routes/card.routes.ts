import * as cardController from "@/controllers/card.controller.ts";
import * as cardRepository from "@/repository/card.repository.ts";
import { requireRole } from "@/middleware/auth.ts";
import { scopeToOwnStudent, requireResourceOwnership } from "@/middleware/ownership.ts";
import { Router } from "express";

const cardRouter = Router();

const loadCardOwner = async (id: number) =>
    (await cardRepository.getCardById(id))?.student_id ?? null;

/* ————————— Read ————————— */

// A student sees only their own card(s); teachers/admins see all.
cardRouter.get("/", scopeToOwnStudent, cardController.getCards);

cardRouter.get("/:id", requireResourceOwnership(loadCardOwner), cardController.getCardById);

/* ————————— Administrative Endpoints ————————— */
// Issuing and revoking cards is admin-only — card UIDs are sensitive.
cardRouter.post("/", requireRole("admin"), cardController.createCard);

cardRouter.delete("/:id", requireRole("admin"), cardController.deleteCard);

export default cardRouter;
