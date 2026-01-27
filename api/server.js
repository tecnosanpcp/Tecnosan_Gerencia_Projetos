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
import homeRoutes from "./routes/home.routes.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tecnosan-gerencia-projetos.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// rotas
app.get("/", async (req, res) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// Rotas de Comuns
app.use("/auth", authRoutes);
app.use("/departments", departmentsRoutes);
app.use("/employees_components", employeesComponentsRoutes);
app.use("/employees", employeesRoutes);
app.use("/materials", materialRoutes);
app.use("/views", viewRoutes);
app.use("/vwSummary", viewsSummaryRoutes);
app.use("/home", homeRoutes);

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

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
