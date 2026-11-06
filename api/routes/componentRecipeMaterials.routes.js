import { Router } from "express";
import {
  createCompRecipeMat,
  readCompRecipeMat,
  readCompRecipeMatByComp,
  updateCompRecipeMat,
  deleteCompRecipeMat,
} from "../controllers/componentRecipeMaterials.controller.js";

const router = Router();

router.post("/", createCompRecipeMat);
router.get("/", readCompRecipeMat);
router.get("/:component_recipe_id", readCompRecipeMatByComp);
router.put("/:component_recipe_id/:material_id", updateCompRecipeMat);
router.delete("/:component_recipe_id/:material_id", deleteCompRecipeMat);


export default router;
