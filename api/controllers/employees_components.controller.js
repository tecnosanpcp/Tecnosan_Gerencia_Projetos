import { pool } from "../config/db.js";

export const getEmployeesComponents = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM EMPLOYEES_COMPONENTS;");

    if (response.rowCount == 0) {
      return res.status(404).json({ menssage: "Nenhum componente encontrado" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: error.menssage });
  }
};

export const createEmployeesComponents = async (req, res) => {
  try {
    const { user_id, component_id } = req.body;

    if (!user_id || !component_id) {
      return res.status(500).json({ error: "dados insuficientes" });
    }

    const response = await pool.query(
      `INSERT INTO EMPLOYEES_COMPONENTS
        (user_id, component_id) 
      VALUES 
        ($1, $2);`,
      [user_id, component_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: error.menssage });
  }
};

export const deleteEmployeesComponents = async (req, res) => {
  try {
    const { component_id, user_id } = req.params;

    if (!component_id || !user_id) {
      return res.status(500).json({ error: "dados insuficientes" });
    }

    const response = await pool.query(
      `DELETE FROM components
      WHERE component_id = $1 and user_id = $2;`,
      [equipment_id, user_id]
    );

    if (response.rowCount == 0) {
      return res.status(404).json({ error: "Componente não foi encontrado" });
    }
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: error.menssage });
  }
};
