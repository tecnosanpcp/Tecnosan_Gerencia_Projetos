import { pool } from "../config/db.js";

export const getEquipment = async (req, res) => {
  try {
    const { project_id } = req.params;
    const response = await pool.query(
      `SELECT * FROM equipments WHERE project_id = $1`,
      [project_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const listEquipments = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM equipments");
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEquipment = async (req, res) => {
  try {
    const {
      equipment_name,
      start_date,
      deadline,
      project_id,
      equipment_recipe_id
    } = req.body;

    if (
      !equipment_name ||
      !start_date ||
      !deadline ||
      !project_id ||
      equipment_recipe_id
    ) {
      res.status(400).json({ message: "Faltando dados" });
      throw new Error("Faltando dados");
    }

    const response = await pool.query(`
      INSERT INTO EQUIPMENTS(equipment_name, start_date, deadline, project_id, equipment_recipe_id)
      VALUES ('TESTE', '14-01-2026', '14-04-2026', 10, 1) RETURNING *`);

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
