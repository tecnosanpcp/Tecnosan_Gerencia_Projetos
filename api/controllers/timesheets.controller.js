import { pool } from "../config/db.js";

export const createTimesheet = async (req, res) => {
  try {
    const { component_id, user_id, start_time, end_time } = req.body;
    if (!component_id || !user_id || !start_time || !end_time) {
      return res.status(401).json({ error: "Faltando dados" });
    }
    if (new Date(end_time) <= new Date(start_time)) {
      return res
        .status(402)
        .json({ error: "A hora final deve ser maior que a inicial." });
    }

    const result = await pool.query(
      `
      INSERT INTO components_timesheets (component_id, user_id, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [component_id, user_id, start_time, end_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar timesheet:", error);
    res.status(500).json({ error: "Erro ao registrar horas." });
  }
};

export const getTimesheetsByComponent = async (req, res) => {
  try {
    const { component_id } = req.params;

    if (!component_id) {
      return res.status(400).json({ error: "Faltando dadoss" });
    }
    const result = await pool.query(
      `SELECT 
        ct.*,
        e.name as employee_name,
        ROUND(EXTRACT(EPOCH FROM (ct.end_time - ct.start_time))::numeric / 3600, 2) as duration_hours
      FROM components_timesheets ct
      LEFT JOIN employees e ON ct.user_id = e.user_id
      WHERE ct.component_id = $1
      ORDER BY ct.start_time DESC;`,
      [component_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar timesheets:", error);
    res.status(500).json({ error: "Erro ao buscar registros." });
  }
};

export const updateTimesheet = async (req, res) => {
  const { timesheet_id } = req.params;
  const { start_time, end_time } = req.body;

  try {
    if (!timesheet_id || !start_time || !end_time) {
      return res.status(400).json({ error: "Faltando dados" });
    }
    if (new Date(end_time) <= new Date(start_time)) {
      return res
        .status(400)
        .json({ error: "A hora final deve ser maior que a inicial." });
    }

    const result = await pool.query(
      `UPDATE components_timesheets
      SET start_time = $1, end_time = $2
      WHERE timesheet_id = $3
      RETURNING *;`,
      [start_time, end_time, timesheet_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar timesheet:", error);
    res.status(500).json({ error: "Erro ao atualizar registro." });
  }
};

export const deleteTimesheet = async (req, res) => {
  try {
    const { timesheet_id } = req.params;
    if (!timesheet_id) {
      return res.status(400).json({ error: "Faltando Dados" });
    }
    const result = await pool.query(
      "DELETE FROM components_timesheets WHERE timesheet_id = $1 RETURNING timesheet_id;",
      [timesheet_id]
    );
    res.json({
      message: "Registro excluído com sucesso.",
      id: result.rows[0].timesheet_id,
    });
  } catch (error) {
    console.error("Erro ao deletar timesheet:", error);
    res.status(500).json({ error: "Erro ao excluir registro." });
  }
};
