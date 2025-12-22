import { Router } from "express";
import {
  vwProjectMaterialsSummary,
  vwTotalsMaterialsProjecst,
  vwStatusEquipments,
  vwStatusProjects,
  totalValuesProjects,
  totalMaterialsProjects,
  getTimelineProjects,
  getTimelineEquipments,
  getTimelineTasks,
  getTimelineEquipmentsByBudget
} from "../controllers/viewsSummary.controller.js";

const router = Router();

// Views de mmateriais
router.get("/projects/:user_id", vwProjectMaterialsSummary);
router.get("/total/projects/:user_id", vwTotalsMaterialsProjecst);

// View de status
router.get("/status/equipments/", vwStatusEquipments);
router.get("/status/projects/", vwStatusProjects);

// View projetos
router.get("/projects-values/:user_id", totalValuesProjects);
router.get("/projects-materials/:user_id", totalMaterialsProjects);

// View Cronogramas (Timeline)
router.get("/projects-timeline", getTimelineProjects); // Visão Macro (Projetos)
router.get("/equipments-timeline", getTimelineEquipments); // Visão Tática (Equipamentos)
router.get("/equipments-timeline/:budget_id", getTimelineEquipmentsByBudget); // Visão Tática (Equipamentos)
router.get("/tasks-timeline", getTimelineTasks); // Visão Detalhada (Componentes/Tarefas)

export default router;
