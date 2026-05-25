import { Router } from "express";
import {
  createProject,
  listProject,
  deleteProject,
  editProject,
  getProject
} from "../controllers/projects.controller.js";

const router = Router();

router.post("/", createProject);
router.get("/:user_id", listProject);
router.get("/:user_id/:project_id", getProject)
router.put("/:project_id", editProject);
router.delete("/", deleteProject);

export default router;
