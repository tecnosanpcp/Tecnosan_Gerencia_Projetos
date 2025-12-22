import { pool } from "../config/db.js";

function buildHierarchy(rows) {
  const projects = {};

  rows.forEach((row) => {
    const {
      project_id,
      project_name,
      equipment_id,
      equipment_name,
      component_id,
      component_name,
      material_name,
      material_id,
      material_type_id,
      total_material_consumed,
      total_value,
    } = row;

    // --- PROJECT ---
    if (!projects[project_id]) {
      projects[project_id] = {
        project_id,
        project_name,
        equipments: {},
      };
    }

    const proj = projects[project_id];

    // --- EQUIPMENT ---
    if (!proj.equipments[equipment_id]) {
      proj.equipments[equipment_id] = {
        equipment_id,
        equipment_name,
        components: {},
      };
    }

    const equip = proj.equipments[equipment_id];

    // --- COMPONENT ---
    if (!equip.components[component_id]) {
      equip.components[component_id] = {
        component_id,
        component_name,
        materials: [],
      };
    }

    const comp = equip.components[component_id];

    // --- MATERIAL ---
    comp.materials.push({
      material_id,
      material_name,
      material_type_id,
      total_material_consumed,
      total_value,
    });
  });

  // transformar objetos internos em arrays
  return Object.values(projects).map((project) => ({
    ...project,
    equipments: Object.values(project.equipments).map((equip) => ({
      ...equip,
      components: Object.values(equip.components),
    })),
  }));
}

export const vwProjectMaterialsSummary = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.res(500).json("O Usuário está vazio");
    }
    const response = await pool.query(
      `SELECT *
       FROM vw_project_consumed_materials 
       WHERE user_id = $1;`,
      [user_id]
    );

    const rows = response.rows;
    res.status(200).json(buildHierarchy(rows));
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar sumário" });
  }
};

export const totalValuesProjects = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id)
      return res.status(404).json({ error: "Usuário não encontrado" });

    const response = await pool.query(
      `SELECT 
          project_id, 
          project_name, 
          SUM(total_value) AS total_value
        FROM 
          vw_project_consumed_materials
        WHERE 
          user_id = $1
        GROUP BY 
          project_id, 
          project_name;`,
      [user_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Falha no back-end" });
  }
};

export const totalMaterialsProjects = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id)
      return res.status(404).json({ error: "Usuário não encontrado" });

    const response = await pool.query(
      `SELECT 
          project_id,
          material_id,
          material_name,
          SUM (total_material_consumed) AS total_value
        FROM vw_project_consumed_materials
        WHERE 
          user_id = $1
        GROUP BY
          project_id,
          material_id,
          material_name
        ORDER BY
          project_id,
          material_id;`,
      [user_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Falha no back-end" });
  }
};

export const vwTotalsMaterialsProjecst = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(500).json({ error: "Usuário vazio" });
    }

    const response = await pool.query(
      `
        SELECT 
          ms.* 
        FROM vw_projects_materials_summary ms 
        JOIN projects_users pu ON pu.project_id = ms.project_id 
        WHERE pu.user_id = $1
        ORDER BY ms.project_id, ms.material_id;;
        `,
      [user_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro na requisição" });
  }
};

export const vwStatusEquipments = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_status_equipments;");

    if (response.rowCount == 0) {
      return res.status(404).json({ error: "Nenhum equipamento encontrado" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro na requisição" });
  }
};

export const vwStatusProjects = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_status_projects;");

    if (response.rowCount == 0) {
      return res.status(404).json({ error: "Nenhum equipamento encontrado" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro na requisição" });
  }
};

export const getTimelineProjects = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_timeline_projects;");

    if (response.rowCount == 0) {
      return res
        .status(404)
        .json({ error: "Nenhum cronograma de projeto encontrado" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error); // Bom para debugar no terminal
    res
      .status(500)
      .json({ error: "Erro na requisição ao buscar cronograma de projetos" });
  }
};

export const getTimelineEquipments = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_timeline_equipments;");

    if (response.rowCount == 0) {
      return res
        .status(404)
        .json({ error: "Nenhum cronograma de equipamento encontrado" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro na requisição ao buscar cronograma de equipamentos",
    });
  }
};

export const getTimelineEquipmentsByBudget = async (req, res) => {
  try {
    const { budget_id } = req.params;

    if (!budget_id) {
      return res.status(505).json({ error: "Orçamento não existe" });
    }
    const response = await pool.query(
      `SELECT vw.* FROM vw_timeline_equipments vw
      JOIN budgets_equipments_recipes ber
        ON ber.equipment_recipe_id = vw.equipment_recipe_id
      WHERE ber.budget_id = $1`,
      [budget_id]
    );

    if (response.rowCount == 0) {
      return res
        .status(404)
        .json({ error: "Nenhum cronograma de equipamento encontrado" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro na requisição ao buscar cronograma de equipamentos",
    });
  }
};

export const getTimelineTasks = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_timeline_tasks;");

    if (response.rowCount == 0) {
      return res
        .status(404)
        .json({ error: "Nenhuma tarefa de componente encontrada" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro na requisição ao buscar tarefas" });
  }
};
