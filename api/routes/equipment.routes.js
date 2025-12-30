import { Router } from "express";
import {
    getEquipment,
    listEquipments
} from "../controllers/equipments.controller.js";

const router = Router();

router.get("/:project_id", getEquipment);
router.get("/", listEquipments)

export default router;
