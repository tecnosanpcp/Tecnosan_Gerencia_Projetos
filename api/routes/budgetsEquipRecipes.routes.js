import { Router } from "express";
import {
  createBudgetsEquipRecipes,
  readBudgetsEquipRecipes,
  updateBudgetsEquipRecipes,
  deleteBudgetsEquipRecipes,
} from "../controllers/budgetsEquipRecipes.controller.js";

const router = Router();

router.post("/", createBudgetsEquipRecipes);
router.get("/", readBudgetsEquipRecipes);
router.put("/:budget_id/:equipment_id", updateBudgetsEquipRecipes);
router.delete("/:budget_id/:equipment_id", deleteBudgetsEquipRecipes);
export default router;
