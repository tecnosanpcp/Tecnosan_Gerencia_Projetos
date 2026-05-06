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

    // --- 1. PROJECT ---
    if (!projects[project_id]) {
      projects[project_id] = {
        project_id,
        project_name,
        equipments: {},
      };
    }

    if (!equipment_id) return;
    const proj = projects[project_id];

    // --- 2. EQUIPMENT ---
    if (!proj.equipments[equipment_id]) {
      proj.equipments[equipment_id] = {
        equipment_id,
        equipment_name,
        components: {},
      };
    }

    if (!component_id) return;
    const equip = proj.equipments[equipment_id];

    // --- 3. COMPONENT ---
    if (!equip.components[component_id]) {
      equip.components[component_id] = {
        component_id,
        component_name,
        materials: [],
      };
    }

    const comp = equip.components[component_id];

    // --- 4. MATERIAL ---
    if (material_id) {
      comp.materials.push({
        material_id,
        material_name,
        material_type_id,
        total_material_consumed,
        total_value,
      });
    }
  });

  return Object.values(projects).map((project) => ({
    ...project,
    equipments: Object.values(project.equipments).map((equip) => ({
      ...equip,
      components: Object.values(equip.components).map((comp) => ({
          ...comp,
          materials: comp.materials || [] 
      })),
    })),
  }));
}

export const vwProjectMaterialsSummary = async (req, res) => { 
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "O ID do usuário é obrigatório" });
    }
    
    const response = await pool.query(
      `SELECT *
       FROM vw_project_consumed_materials 
       WHERE user_id = $1;`,
      [user_id]
    );

    res.status(200).json(buildHierarchy(response.rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno ao listar sumário" });
  }
};

export const totalValuesProjects = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "O ID do usuário é obrigatório" });
    }

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
    console.error(error);
    res.status(500).json({ error: "Falha interna no servidor" });
  }
};

export const totalMaterialsProjects = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "O ID do usuário é obrigatório" });
    }

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
    console.error(error);
    res.status(500).json({ error: "Falha interna no servidor" });
  }
};

// Alterado o nome da função corrigindo o typo (lembre de mudar na rota!)
export const vwTotalsMaterialsProjects = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "O ID do usuário é obrigatório" });
    }

    const response = await pool.query(
      `SELECT 
          ms.* 
        FROM vw_projects_materials_summary ms 
        JOIN projects_users pu ON pu.project_id = ms.project_id 
        WHERE pu.user_id = $1
        ORDER BY ms.project_id, ms.material_id;`,
      [user_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno na requisição" });
  }
};

export const vwStatusEquipments = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_status_equipments;");
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno na requisição" });
  }
};

export const vwStatusProjects = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_status_projects;");
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno na requisição" });
  }
};

export const getTimelineProjects = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_timeline_projects;");
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cronograma de projetos" });
  }
};

export const getTimelineEquipments = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_timeline_equipments;");
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cronograma de equipamentos" });
  }
};

export const getTimelineEquipmentsByBudget = async (req, res) => {
  try {
    const { budget_id } = req.params;

    if (!budget_id) {
      return res.status(400).json({ error: "O ID do orçamento é obrigatório" });
    }
    
    const response = await pool.query(
      `SELECT vw.* FROM vw_timeline_equipments vw
       JOIN budgets_equipments_recipes ber
         ON ber.equipment_recipe_id = vw.equipment_recipe_id
       WHERE ber.budget_id = $1;`,
      [budget_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cronograma de equipamentos" });
  }
};

export const getTimelineTasks = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_timeline_tasks;");
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar tarefas do cronograma" });
  }
};

export const vwComponentMaterialsSummary = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM vw_component_materials_summary;");
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno no servidor", details: error.message });
  }
};