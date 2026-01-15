import express from "express";
import {
  createTimesheet,
  getTimesheetsByComponent,
  updateTimesheet,
  deleteTimesheet,
} from "../controllers/timesheets.controller.js";

const router = express.Router();

router.post("/", createTimesheet);
router.get("/component/:component_id", getTimesheetsByComponent);
router.put("/:timesheet_id", updateTimesheet);
router.delete("/:timesheet_id", deleteTimesheet);

export default router;
