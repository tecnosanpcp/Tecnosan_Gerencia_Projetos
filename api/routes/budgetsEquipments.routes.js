import { Router } from "express";
import {
  createBudgetEquipment,
  listBudgetEquipments,
  readBudgetEquipmentById,
  updateBudgetEquipment,
  deleteBudgetEquipment,
} from "../controllers/budgetsEquipments.controller.js";

const router = Router();

router.post("/", createBudgetEquipment);
router.get("/", listBudgetEquipments);
router.get("/budget/:budget_id", listBudgetEquipments);
router.get("/:budget_equipment_id", readBudgetEquipmentById);
router.put("/:budget_equipment_id", updateBudgetEquipment);
router.delete("/:budget_equipment_id", deleteBudgetEquipment);

export default router;
