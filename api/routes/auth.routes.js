import { Router } from "express";
import { Login, VerifyAuth, Register } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", Login);
router.post("/register", Register);
router.get("/verify", VerifyAuth);

export default router;
