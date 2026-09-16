import * as authController from "@/controllers/auth.controller.ts";
import { requireAuth, requireRole } from "@/middleware/auth.ts";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/login", authController.login);

authRouter.post("/register", requireAuth, requireRole("admin"), authController.register);

export default authRouter;
