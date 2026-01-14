import { Router } from "express";
import {
    getEquipment,
    listEquipments,
    createEquipment
} from "../controllers/equipments.controller.js";

const router = Router();

router.get("/:project_id", getEquipment);
router.get("/", listEquipments)
router.post("/", createEquipment)

export default router;
