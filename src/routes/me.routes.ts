import { Router } from "express";
import { requireAuth } from "@/middleware/auth.ts";
import * as userRepository from "@/repository/user.repository.ts";
import { NotFoundError } from "@/utils/AppError.ts";

const meRouter = Router();

meRouter.get("/", requireAuth, async (req, res, next) => {
    try {
        const user = await userRepository.getUserById(req.user!.id);
        if (!user) throw new NotFoundError("User not found");
        const { password_hash, ...safe } = user;
        return res.status(200).json(safe);
    } catch (error) {
        next(error);
    }
});

export default meRouter;
