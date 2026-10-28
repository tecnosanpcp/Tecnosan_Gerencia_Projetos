import { Router } from "express";
import {
  getComponentRecipe,
  createComponentRecipe,
  deleteComponentRecipe,
  updateComponentRecipe,
} from "../controllers/componentRecipes.controller.js";

import { importComponentRecipes } from "../controllers/componentRecipes.controller.js";

import { deleteComponentRecipesBatch } from "../controllers/exclusaoLotes.controller.js";

const router = Router();

router.get("/", getComponentRecipe);
router.post("/", createComponentRecipe);
router.delete("/:id", deleteComponentRecipe);
router.put("/:id", updateComponentRecipe);

router.post("/import", importComponentRecipes);
router.post("/delete-batch", deleteComponentRecipesBatch);

export default router;
