import { Router } from "express";
import {
  getEquipmentRecipe,
  createEquipmentRecipe,
  deleteEquipmentRecipe,
  updateEquipmentRecipe,
} from "../controllers/equipmenetRecipe.controller.js";
import { importEquipmentRecipes } from "../controllers/equipmenetRecipe.controller.js";
import { deleteEquipmentRecipesBatch } from "../controllers/exclusaoLotes.controller.js";
const router = Router();

router.get("/", getEquipmentRecipe);
router.post("/", createEquipmentRecipe);
router.delete("/:equipment_recipe_id", deleteEquipmentRecipe);
router.put("/:equipment_recipe_id", updateEquipmentRecipe);
router.post("/import", importEquipmentRecipes);
router.post("/delete-batch", deleteEquipmentRecipesBatch);

export default router;
