import { Router } from "express";
import {
  getComponentStatus,
  getComponents,
  createComponents,
  updateComponents,
  deleteComponent,
  getComponentStatusByProj,
  getLeadTimeComparison,
  updateDate,
  updateStatus,
  getStatus
} from "../controllers/components.controller.js";

const router = Router();

router.get("/status/:project_id/:equipment_id/:start_date/:end_date", getComponentStatus); 
router.get("/status", getStatus); 
router.get("/statusByProj", getComponentStatusByProj);
router.get("/lead-time-comparison", getLeadTimeComparison);
router.get("/", getComponents);
router.post("/", createComponents);
router.put("/:component_id", updateComponents);
router.put("/date/:component_id", updateDate);
router.put("/status/:component_id", updateStatus);
router.delete("/", deleteComponent);

export default router;
