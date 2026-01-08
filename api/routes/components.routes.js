import { Router } from "express";
import {
  getComponentStatus,
  getComponents,
  createComponents,
  updateComponents,
  deleteComponent,
} from "../controllers/components.controller.js";

const router = Router();

router.get("/status/:project_id/:equipment_id/:start_date/:end_date", getComponentStatus);
router.get("/", getComponents);
router.post("/", createComponents);
router.put("/:component_id", updateComponents);
router.delete("/", deleteComponent);

export default router;
