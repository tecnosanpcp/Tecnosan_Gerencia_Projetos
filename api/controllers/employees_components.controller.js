import { pool } from "../config/db.js";

export const getEmployeesComponents = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM EMPLOYEES_COMPONENTS;");
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
      `DELETE FROM employees_components 
       WHERE component_id = $1 AND user_id = $2;`,
      [component_id, user_id]
    );
    res.status(200).json({ message: "Deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
