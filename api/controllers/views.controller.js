import { pool } from "../config/db.js";

export const vwProjectConsumedMaterials = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!user_id) {
      res.status(500).json("O usuário está vazio!");
    }

    const response = await pool.query(
      "SELECT * FROM vw_project_consumed_materials WHERE user_id = $1",
      [user_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao contar status dos componentes", error);
    res.status(500).json({ error: "Erro ao contar status dos componentes" });
  }
};

export const vwProjectDepartmentDelays = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT department_name, component_name, days_late FROM vw_project_department_delays"
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao listar atrassos dos departamentos", error);
    res
      .status(500)
      .json({ error: "Erro ao listar atrassos dos departamentos " + error });
  }
};

export const vwComponentRecipeMaterialsSummary = async (req, res) => {
  try {
    const response = await pool.query(
      "select * from vw_components_recipes_materials_summary"
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao contar materiais da receita do componente", error);
    res.status(500).json({
      error: "Erro ao contar materiais da receita do componente" + error,
    });
  }
};

export const vwEquipmentRecipesMaterialSummary = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT * FROM vw_equipments_recipes_materials_summary"
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(
      "Erro ao listar o sumario de materiais do equipamento",
      error
    );
    res.status(500).json({
      error: "Erro ao listar o sumario de materiais do equipamento" + error,
    });
  }
};

export const vwBudgetsMaterialsSummary = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT * FROM vw_budgets_materials_summary"
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao listar o sumario de materiais do orçamento", error);
    res.status(500).json({
      error: "Erro ao listar o sumario de materiais do orçamento" + error,
    });
  }
};

export const vwMaterialDetailsComponentsRecipes = async (req, res) => {
  try {
    const { component_recipe_id } = req.params;

    if (!component_recipe_id) {
      return res.status(400).json({ error: "Faltando dados" });
    }

    const response = await pool.query(
      "SELECT * FROM Vw_Material_Details_Components_Recipes WHERE component_recipe_id = $1",
      [component_recipe_id]
    );

    return res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const vwMaterialDetailsEquipmentsRecipes = async (req, res) => {
  try {
    const { equipment_recipe_id } = req.params;

    if (!equipment_recipe_id) {
      return res.status(400).json({ error: "Faltando dados" });
    }

    const response = await pool.query(
      "SELECT * FROM Vw_Material_Details_Equipment_Recipes WHERE equipment_recipe_id = $1",
      [equipment_recipe_id]
    );

    return res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const getTimesCascade = async (req, res) => {
  try {
    // Consultas às novas views criadas
    const projectQuery = await pool.query(`SELECT * FROM vw_project_hours;`);
    const equipmentQuery = await pool.query(
      `SELECT * FROM vw_equipment_hours;`
    );
    const componentQuery = await pool.query(
      `SELECT * FROM vw_component_hours;`
    );

    const result = {
      projects: {},
      equipments: {},
      components: {},
    };

    // ----- PROJECTS -----
    // Mapeamos 'actual_start' para 'start_date' para manter compatibilidade com seu Front-end
    projectQuery.rows.forEach((row) => {
      result.projects[row.project_id] = {
        project_id: row.project_id,
        // Usamos o realizado (actual), se não houver, o planejado (planned)
        start_date: row.actual_start || row.planned_start,
        end_date: row.actual_end || row.planned_deadline,
        total_hours: parseFloat(row.total_hours || 0),
        qtd_employees: parseInt(row.qtd_employees || 0),
      };
    });

    // ----- EQUIPMENTS -----
    equipmentQuery.rows.forEach((row) => {
      result.equipments[row.equipment_id] = {
        equipment_id: row.equipment_id,
        start_date: row.actual_start || row.planned_start,
        end_date: row.actual_end || row.planned_deadline,
        total_hours: parseFloat(row.total_hours || 0),
        qtd_employees: parseInt(row.qtd_employees || 0),
      };
    });

    // ----- COMPONENTS -----
    // Na vw_component_hours, as colunas são start_date (tabela) e end_date (MAX da execução)
    componentQuery.rows.forEach((row) => {
      result.components[row.component_id] = {
        component_id: row.component_id,
        start_date: row.start_date, // Data de início do componente
        end_date: row.end_date || row.deadline, // Fim real ou prazo
        total_hours: parseFloat(row.total_hours || 0),
        qtd_employees: parseInt(row.qtd_employees || 0),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar dados em cascata:", error);
    res.status(500).json({ error: "Erro interno ao processar cronograma." });
  }
};
