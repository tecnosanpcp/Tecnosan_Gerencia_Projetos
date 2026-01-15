import express from "express";
import cors from "cors";

// Rotas Comuns
import authRoutes from "./routes/auth.routes.js";
import departmentsRoutes from "./routes/departments.routes.js";
import employeesRoutes from "./routes/employees.routes.js";
import materialRoutes from "./routes/materiails.routes.js";
import viewRoutes from "./routes/view.routes.js";
import viewsSummaryRoutes from "./routes/viewsSummary.routes.js";

// Rotas para o que é Realmente produzido

import componentsRoutes from "./routes/components.routes.js";
import equipmentRoutes from "./routes/equipment.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import timesheetRoutes from "./routes/timesheet.routes.js";

// Rotas para Receitas / Planejamento

import componentRecipeMaterialsRouter from "./routes/componentRecipeMaterials.routes.js";
import componentRecipeRoutes from "./routes/componentRecipes.routes.js";
import equipRecipeCompRecipeRoutes from "./routes/equipRecipeCompRecipe.routes.js";
import equipmentRecipeRouter from "./routes/equipmentRecipe.routes.js";
import budgetsEquipRecipesRouter from "./routes/budgetsEquipRecipes.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import employeesComponentsRoutes from "./routes/employees_components.routes.js";
import componentsMaterialsRoutes from "./routes/components.materials.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// rotas

// Rotas de Comuns
app.use("/auth", authRoutes);
app.use("/departments", departmentsRoutes);
app.use("/employees_components", employeesComponentsRoutes);
app.use("/employees", employeesRoutes);
app.use("/materials", materialRoutes);
app.use("/views", viewRoutes);
app.use("/vwSummary", viewsSummaryRoutes);

// Rotas para o que é Realmente produzido
app.use("/components", componentsRoutes);
app.use("/components/materials", componentsMaterialsRoutes);
app.use("/equipments", equipmentRoutes);
app.use("/projects", projectsRoutes);
app.use("/timesheets", timesheetRoutes);

// Rotas para Receitas / Planejamento
app.use("/comp-recipe-mat", componentRecipeMaterialsRouter);
app.use("/component-recipes", componentRecipeRoutes);
app.use("/equip-recipe-comp-recipe", equipRecipeCompRecipeRoutes);
app.use("/equip-recipe", equipmentRecipeRouter);
app.use("/budgets-equip-recipes", budgetsEquipRecipesRouter);
app.use("/budgets", budgetRoutes);

app.listen(3001, () => {
  console.log("API rodando na porta 3001");
});
