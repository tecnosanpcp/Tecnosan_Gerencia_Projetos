import { pool } from "../config/db.js";

export const createProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      user_id,
      project_name,
      project_desc,
      project_local,
      begin_date,
      end_date,
      deadline,
      status,
      budget_id,
    } = req.body;

    // Basic validation
    if (!user_id || !project_name || !budget_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    await client.query("BEGIN");

    // Create project
    const projectResult = await client.query(
      `INSERT INTO projects (
        project_name, 
        project_desc, 
        project_local, 
        start_date, 
        completion_date, 
        deadline,
        status,
        budget_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING project_id`,
      [
        project_name?.trim(),
        project_desc?.trim(),
        project_local?.trim(),
        begin_date,
        end_date,
        deadline,
        status.trim(),
        budget_id,
      ]
    );

    const project_id = projectResult.rows[0].project_id;
    // Associate project with user
    await client.query(
      `INSERT INTO projects_users (user_id, project_id)
       VALUES ($1, $2)`,
      [user_id, project_id]
    );

    await client.query("COMMIT");
    client.release();

    return res.status(200).json({
      message: "Project created successfully.",
      project_id,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    client.release();
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Error creating project." });
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
