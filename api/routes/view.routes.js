import { Router } from "express";
import {
  vwProjectConsumedMaterials,
  vwProjectDepartmentDelays,
  vwComponentRecipeMaterialsSummary,
  vwEquipmentRecipesMaterialSummary,
  vwBudgetsMaterialsSummary,
  vwMaterialDetailsComponentsRecipes,
  vwMaterialDetailsEquipmentsRecipes,
  getTimesCascade,
  vwComponentRecipeMaterials,
  vwEquipmentMaterialsSummary
} from "../controllers/views.controller.js";

const router = Router();

router.get("/project-consumed-materials/:user_id", vwProjectConsumedMaterials);
router.get("/project-department-delays", vwProjectDepartmentDelays);

router.get("/component/summary/:budget_id", vwComponentRecipeMaterialsSummary);
router.get("/equipment/summary/:budget_id",vwEquipmentRecipesMaterialSummary);
router.get("/budgets-materials-summary",vwBudgetsMaterialsSummary);

router.get("/material-details-componentes-recipes/:component_recipe_id", vwMaterialDetailsComponentsRecipes);
router.get("/material-details-equipment-recipes/:equipment_recipe_id", vwMaterialDetailsEquipmentsRecipes);

router.get("/get-times", getTimesCascade);

router.get("/recipe/component", vwComponentRecipeMaterials)
router.get("/recipe/equipment", vwEquipmentMaterialsSummary)
export default router;
