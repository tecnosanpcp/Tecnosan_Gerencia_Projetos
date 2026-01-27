import { Router } from "express";
import {
  Login,
  VerifyAuth,
  Register,
  updatePassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", Login);
router.post("/register", Register);
router.get("/verify", VerifyAuth);
router.put("/:user_id", updatePassword);

export default router;
