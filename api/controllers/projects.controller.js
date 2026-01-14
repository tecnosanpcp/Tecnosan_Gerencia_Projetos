import { pool } from "../config/db.js";

// NOTE: A criação de equipamentos e componentes é feita via Database Triggers (trg_auto_create_equipments).
export const createProject = async (req, res) => {
  try {
    const {
      user_id,
      project_name,
      project_desc,
      project_local,
      budget_id, // Só isso importa agora
    } = req.body;

    // Apenas inserimos o projeto. O Banco fará o resto.
    const result = await pool.query(
      `INSERT INTO projects (project_name, project_desc, project_local, status, budget_id)
       VALUES ($1, $2, $3, 'Pending', $4)
       RETURNING project_id`,
      [project_name, project_desc, project_local, budget_id]
    );

    const newProjectId = result.rows[0].project_id;

    // Vincula o usuário
    await pool.query(
      "INSERT INTO projects_users (user_id, project_id) VALUES ($1, $2)",
      [user_id, newProjectId]
    );

    res.status(200).json({ 
        message: "Projeto gerado automaticamente pelo Banco de Dados!", 
        project_id: newProjectId 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const listProject = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      res.status(400).json({ message: "Faltando dados" });
      throw new Error("Faltando Dados");
    }

    const result = await pool.query(
      `SELECT p.*
       FROM projects p
       INNER JOIN projects_users pu ON p.project_id = pu.project_id
       WHERE pu.user_id = $1
       ORDER BY project_name`,
      [user_id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error listing projects:", error);
    return res.status(500).json({ error: "Error listing projects." });
  }
};

export const editProject = async (req, res) => {
  try {
    const {
      project_id,
      project_name,
      project_desc,
      project_local,
      begin_date,
      end_date,
      deadline,
    } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: "project_id is required." });
    }

    const result = await pool.query(
      `UPDATE projects
       SET project_name = $1,
           project_desc = $2,
           project_local = $3,
           begin_date = $4,
           end_date = $5,
           deadline = $6
       WHERE project_id = $7
       RETURNING *`,
      [
        project_name,
        project_desc,
        project_local,
        begin_date,
        end_date,
        deadline,
        project_id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error editing project:", error);
    return res.status(500).json({ error: "Error editing project." });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: "project_id is required." });
    }

    const result = await pool.query(
      `DELETE FROM projects
       WHERE project_id = $1
       RETURNING *`,
      [project_id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Error deleting project." });
  }
};
