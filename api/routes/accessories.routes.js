import { Router } from "express";
import { 
  createAccessory, 
  listAccessories, 
  updateAccessory, 
  deleteAccessory, 
  loanToProject, 
  loanToBudget, 
  returnAccessory, 
  listActiveLoans,
  listBudgetHistory,
  updateBudgetLoan, 
  deleteBudgetLoan  
} from "../controllers/accessories.controller.js";
import { importAccessories } from "../controllers/accessories.controller.js";
import { deleteAccessoriesBatch } from "../controllers/exclusaoLotes.controller.js";

const router = Router();

// ==================================================================
// ROTAS ESPECÍFICAS (DEVEM VIR PRIMEIRO)
// ==================================================================

// 1. Empréstimos e Devoluções
router.get("/loans/active", listActiveLoans);
router.get('/budget/history', listBudgetHistory)
router.post("/loan/project", loanToProject);
router.post("/loan/budget", loanToBudget);
router.put("/return", returnAccessory); 
router.get("/", listAccessories);
router.post("/", createAccessory);

router.put("/:id", updateAccessory); 
router.put("/budget/:id", updateBudgetLoan);   
router.delete("/budget/:id", deleteBudgetLoan); 
router.delete("/:id", deleteAccessory);
router.post("/import", importAccessories);
router.post("/delete-batch", deleteAccessoriesBatch);

export default router;