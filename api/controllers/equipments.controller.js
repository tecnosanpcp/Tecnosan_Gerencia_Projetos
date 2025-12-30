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
