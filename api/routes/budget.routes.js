import { Router } from "express";
import {
  createBudget,
  listBudget,
  uploadStatusBudget,
} from "../controllers/budget.controller.js";

const router = Router();

router.post("/", createBudget);
router.get("/:user_id", listBudget);
router.put("/status/:budget_id", uploadStatusBudget);

export default router;
