import { Router } from "express";
import {
    vwProjectMaterialsSummary,
    vwEquipmentMaterialsSummary,
    vwComponentMaterialsSummary,
    vwTotalsMaterialsProjecst,
} from "../controllers/viewsSummary.controller.js"

const router = Router()

router.get("/projects/:user_id", vwProjectMaterialsSummary)
router.get("/equipments", vwEquipmentMaterialsSummary)
router.get("/components", vwComponentMaterialsSummary)
router.get("/total/projects/:user_id", vwTotalsMaterialsProjecst)

export default router;