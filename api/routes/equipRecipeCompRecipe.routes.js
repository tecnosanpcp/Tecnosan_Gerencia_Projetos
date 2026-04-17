import { Router } from "express";
import {
    createEquipRecipeCompRecipe,
    readEquipRecipeCompRecipe,
    readEquipRecipeCompRecipeById,
    updateEquipRecipeCompRecipe,
    deleteEquipRecipeCompRecipe,
    updateDates
} from "../controllers/equipRecipeCompRecipe.controller.js"

const router = Router();

router.post("/", createEquipRecipeCompRecipe) 
router.get("/", readEquipRecipeCompRecipe);
router.get("/:equipment_recipe_id", readEquipRecipeCompRecipeById);
router.put("/:equipment_recipe_id/:component_recipe_id", updateEquipRecipeCompRecipe);
router.put("/dates/:equipment_recipe_id/:component_recipe_id", updateDates);
router.delete("/:equipment_recipe_id/:component_recipe_id", deleteEquipRecipeCompRecipe);
export default router;