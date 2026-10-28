import { Router } from "express";
import {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/materials.controller.js";
import { importMaterials } from "../controllers/materials.controller.js";
import { deleteMaterialsBatch } from "../controllers/exclusaoLotes.controller.js";  
const router = Router();

router.get("/", listMaterials);
router.post("/", createMaterial);
router.put("/:id", updateMaterial);
router.delete("/:id", deleteMaterial);
router.post("/import", importMaterials);
router.post("/delete-batch", deleteMaterialsBatch);

export default router;
