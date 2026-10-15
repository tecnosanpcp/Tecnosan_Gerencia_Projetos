import { Router } from "express";
import {
  createEquipRecipeCompRecipe,
  readEquipRecipeCompRecipe,
  readEquipRecipeCompRecipeById,
  updateEquipRecipeCompRecipe,
  updateRecipeSchedule,
  deleteEquipRecipeCompRecipe,
} from "../controllers/equipRecipeCompRecipe.controller.js";

const router = Router();

router.post("/", createEquipRecipeCompRecipe);
router.get("/", readEquipRecipeCompRecipe);
router.get("/:equipment_recipe_id", readEquipRecipeCompRecipeById);
router.put("/:equipment_recipe_id/:component_recipe_id", updateEquipRecipeCompRecipe);
// era PUT /dates/:equipment_recipe_id/:component_recipe_id (planned_start_at/planned_end_at)
// agora recebe offset_start_hours/duration_hours
router.put("/schedule/:equipment_recipe_id/:component_recipe_id", updateRecipeSchedule);
router.delete("/:equipment_recipe_id/:component_recipe_id", deleteEquipRecipeCompRecipe);

export default router;
