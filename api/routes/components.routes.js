import { Router } from "express";
import {
  getComponentStatus,
  getComponents,
  createComponents,
  updateComponents,
  deleteComponent,
} from "../controllers/components.controller.js";

const router = Router();

router.get("/status", getComponentStatus);
router.get("/", getComponents);
router.post("/", createComponents);
router.put("/", updateComponents);
router.delete("/", deleteComponent);

export default router;
