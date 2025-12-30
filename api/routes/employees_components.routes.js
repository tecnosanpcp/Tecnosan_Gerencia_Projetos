import { Router } from "express";
import {
  getEmployeesComponents,
  createEmployeesComponents,
  deleteEmployeesComponents
} from "../controllers/employees_components.controller.js"

const router = Router();
router.get("/", getEmployeesComponents);
router.post("/", createEmployeesComponents);
router.delete("/:component_id/:user_id", deleteEmployeesComponents);

export default router;
