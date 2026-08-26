import { Router } from "express";
import {
  createBudgetComponentSchedule,
  listBudgetComponentSchedule,
  updateBudgetComponentSchedule,
  deleteBudgetComponentSchedule,
  upsertBudgetComponentSchedule,
  generateScheduleFromRecipe,
} from "../controllers/budgetsComponentsSchedule.controller.js";

const router = Router();

router.post("/", createBudgetComponentSchedule);
router.get("/", listBudgetComponentSchedule);
router.get("/equipment/:budget_equipment_id", listBudgetComponentSchedule);
router.put("/:id", updateBudgetComponentSchedule);
// upsert por chave natural (budget_equipment_id, component_recipe_id),
// para telas que editam data a data sem conhecer o "id" da linha
router.put(
  "/:budget_equipment_id/:component_recipe_id",
  upsertBudgetComponentSchedule
);
router.delete("/:id", deleteBudgetComponentSchedule);
// gera o cronograma inteiro de um equipamento de orçamento a partir da receita
router.post("/equipment/:budget_equipment_id/generate", generateScheduleFromRecipe);

export default router;