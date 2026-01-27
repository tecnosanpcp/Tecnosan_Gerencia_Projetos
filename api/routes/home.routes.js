import { Router } from "express";
import {
  getMaterialsConsumption,
  getMaterialsWaste,
  getProjectsEvolution,
  getEmployeesAnalytics,
  getYearlyKPIs
} from "../controllers/home.controller.js";

const router = Router();
router.get("/materials-consumption", getMaterialsConsumption);
router.get("/materials-waste", getMaterialsWaste);
router.get("/projects-evolution", getProjectsEvolution);
router.get("/employees-analytics", getEmployeesAnalytics);
router.get("/kpis", getYearlyKPIs);

export default router;
