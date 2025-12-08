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

export const vwEquipmentMaterialsSummary = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.res(500).json("O Usuário está vazio");
    }
    const response = await pool.query(
      `SELECT vw.* 
         FROM vw_equipment_materials_summary vw
         JOIN projects_equipments pe ON vw.equipment_id = pe.equipment_id
         JOIN projects p ON p.project_id = pe.project_id
         JOIN projects_users pu ON pu.project_id = p.project_id
         WHERE pu.user_id = $1;`,
      [user_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar sumário" });
  }
};

export const vwComponentMaterialsSummary = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!user_id) {
      return res.res(500).json("O Usuário está vazio");
    }
    const response = await pool.query(
      `SELECT vw.*
       FROM vw_component_materials_summary vw
       JOIN components c ON c.component_id = vw.component_id
       JOIN equipments_components ec ON ec.component_id = c.component_id
       JOIN equipments e ON e.equipment_id = ec.equipment_id
       JOIN projects_equipments pe ON e.equipment_id = pe.equipment_id
       JOIN projects p ON p.project_id = pe.project_id
       JOIN projects_users pu ON pu.project_id = p.project_id
       WHERE pu.user_id = $1;`[user_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar sumário" });
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
    res.status(500).json({ error: "Erro na requisição " });
  }
};
