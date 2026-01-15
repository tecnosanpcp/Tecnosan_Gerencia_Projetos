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
      "SELECT * FROM vw_project_department_delays"
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
    const { budget_id } = req.params;

    if (!budget_id)
      return res.start_date(505).json({ error: "Dados faltantes" });

    const response = await pool.query(
      `SELECT
        er_cr.equipment_recipe_id,
        er_cr.quantity_plan,
        vwcrms.*
      FROM budgets b
      JOIN budgets_equipments_recipes b_er
        ON b.budget_id = b_er.budget_id
      JOIN equipment_recipes er
        ON er.equipment_recipe_id = b_er.equipment_recipe_id
      JOIN equipment_recipes_component_recipes er_cr
        ON er_cr.equipment_recipe_id = er.equipment_recipe_id
      JOIN vw_components_recipes_materials_summary vwcrms
        ON vwcrms.component_recipe_id = er_cr.component_recipe_id
      WHERE 
        b.budget_id = $1`,
      [budget_id]
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
    const { budget_id } = req.params;

    if (!budget_id) return res.status(505).json({ error: "Dados faltantes" });

    const response = await pool.query(
      `SELECT
        b_er.quantity_plan,
        vwrms.*
      FROM budgets b
      JOIN budgets_equipments_recipes b_er
        ON b.budget_id = b_er.budget_id
      JOIN vw_equipments_recipes_materials_summary vwrms
        ON vwrms.equipment_recipe_id = b_er.equipment_recipe_id
      WHERE 
        b.budget_id = $1`,
      [budget_id]
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
    // 1. Buscando dados (O SQL já traz os nomes das colunas corretos)
    const projectQuery = await pool.query("SELECT * FROM vw_project_hours;");
    const equipmentQuery = await pool.query("SELECT * FROM vw_equipment_hours;");
    const componentQuery = await pool.query("SELECT * FROM vw_component_hours;");

    const result = {
      projects: {},
      equipments: {},
      components: {},
    };

    // FUNÇÃO AUXILIAR: Transforma Array em Objeto indexado por ID
    // Isso evita repetir código nos 3 loops
    const mapRowsToId = (rows, idField, targetObject) => {
      rows.forEach((row) => {
        targetObject[row[idField]] = {
          ...row,
          total_hours: Number(row.total_hours || 0),
          qtd_employees: Number(row.qtd_employees || 0),
        };
      });
    };

    mapRowsToId(projectQuery.rows, 'project_id', result.projects);
    mapRowsToId(equipmentQuery.rows, 'equipment_id', result.equipments);
    mapRowsToId(componentQuery.rows, 'component_id', result.components);

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar dados em cascata:", error);
    res.status(500).json({ error: "Erro interno ao processar cronograma." });
  }
};

export const vwComponentRecipeMaterials = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT * FROM vw_components_recipes_materials_summary"
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao buscar resumo de materiais de componentes", error);
    res.status(500).json({ error: "Erro interno ao buscar componentes" });
  }
};

export const vwEquipmentMaterialsSummary = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT * FROM vw_equipments_recipes_materials_summary"
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao buscar resumo de materiais de equipamentos", error);
    res.status(500).json({ error: "Erro interno ao buscar equipamentos" });
  }
};

export const projectTask = async (req, res) => {
  try {
    const { component_id } = req.params;

    if (!component_id)
      return res.status(400).json({ error: "Dados insuficientes" });

    const response = await pool.query(
      `SELECT 
	        E.PROJECT_ID
        FROM COMPONENTS C
        LEFT JOIN 
	        EQUIPMENTS E ON E.EQUIPMENT_ID = C.EQUIPMENT_ID
        WHERE 
	        C.COMPONENT_ID = $1;`,
      [component_id]
    );

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.json(500).json({ error: "Erro no servidor interno" });
  }
};

export const employeesTask = async (req, res) => {
  try {
    const { component_id } = req.params;

    if (!component_id)
      return res.status(400).json({ error: "Dados insuficientes" });

    const response = await pool.query(
      `SELECT 
        EC.USER_ID
      FROM EMPLOYEES_COMPONENTS EC
      LEFT JOIN 
        COMPONENTS C ON C.COMPONENT_ID = EC.COMPONENT_ID
      WHERE C.COMPONENT_ID = $1;`,
      [component_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.json(500).json({ error: "Erro no servidor interno" });
  }
};
